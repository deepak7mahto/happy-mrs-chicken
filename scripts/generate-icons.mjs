#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const ICONS_DIR = resolve(ROOT_DIR, 'public', 'icons');

mkdirSync(ICONS_DIR, { recursive: true });

// CRC-32 calculation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBody = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcBody);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodeRGBAtoPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter None
    const srcOffset = y * width * 4;
    rgbaBuffer.copy(scanlines, rowOffset + 1, srcOffset, srcOffset + width * 4);
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function renderTrishuIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (y * size + x) * 4;
    const currentA = buf[idx + 3] / 255;
    const blendA = a / 255;
    const outA = blendA + currentA * (1 - blendA);
    if (outA > 0) {
      buf[idx] = Math.round((r * blendA + buf[idx] * currentA * (1 - blendA)) / outA);
      buf[idx + 1] = Math.round((g * blendA + buf[idx + 1] * currentA * (1 - blendA)) / outA);
      buf[idx + 2] = Math.round((b * blendA + buf[idx + 2] * currentA * (1 - blendA)) / outA);
      buf[idx + 3] = Math.round(outA * 255);
    }
  }

  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    const r2 = radius * radius;
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(size - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(size - 1, Math.ceil(cy + radius));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        if (d2 <= r2) {
          const edgeDist = radius - Math.sqrt(d2);
          const alphaFactor = Math.min(1, Math.max(0, edgeDist + 0.5));
          setPixel(x, y, r, g, b, a * alphaFactor);
        }
      }
    }
  }

  const s = size / 100;

  // Background
  if (isMaskable) {
    // Full background for maskable safe-zone
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        setPixel(x, y, 0x0f, 0x17, 0x2a, 255); // Dark Slate theme base
      }
    }
    // Inner badge
    fillCircle(50 * s, 50 * s, 42 * s, 0x64, 0xC8, 0xFA, 255);
  } else {
    // Round badge
    fillCircle(50 * s, 50 * s, 48 * s, 0x37, 0x47, 0x4F, 255); // Border
    fillCircle(50 * s, 50 * s, 45 * s, 0x64, 0xC8, 0xFA, 255); // Cyan body
  }

  // Pigtails (Hair buns on sides)
  fillCircle(25 * s, 36 * s, 11 * s, 0x5D, 0x40, 0x37, 255); // Left bun
  fillCircle(75 * s, 36 * s, 11 * s, 0x5D, 0x40, 0x37, 255); // Right bun
  fillCircle(25 * s, 36 * s, 4.5 * s, 0xFF, 0x52, 0x52, 255); // Left hair bow
  fillCircle(75 * s, 36 * s, 4.5 * s, 0xFF, 0x52, 0x52, 255); // Right hair bow

  // Face Head
  fillCircle(50 * s, 52 * s, 26 * s, 0xE6, 0x51, 0x00, 255); // Outline
  fillCircle(50 * s, 52 * s, 24 * s, 0xFF, 0xCC, 0x80, 255); // Skin tone

  // Hair Bangs
  fillCircle(50 * s, 35 * s, 20 * s, 0x5D, 0x40, 0x37, 255); // Top hair
  fillCircle(50 * s, 42 * s, 18 * s, 0xFF, 0xCC, 0x80, 255); // Clear lower forehead

  // Rosy cheeks
  fillCircle(35 * s, 58 * s, 5 * s, 0xFF, 0x8A, 0x65, 200);
  fillCircle(65 * s, 58 * s, 5 * s, 0xFF, 0x8A, 0x65, 200);

  // Big Eyes
  fillCircle(41 * s, 50 * s, 4.5 * s, 0x21, 0x21, 0x21, 255);
  fillCircle(59 * s, 50 * s, 4.5 * s, 0x21, 0x21, 255);
  // Eye sparkles
  fillCircle(40 * s, 48.5 * s, 1.5 * s, 0xFF, 0xFF, 0xFF, 255);
  fillCircle(58 * s, 48.5 * s, 1.5 * s, 0xFF, 0xFF, 0xFF, 255);

  // Smile
  for (let angle = 0; angle <= Math.PI; angle += 0.05) {
    const rx = 50 * s + Math.cos(angle) * (7 * s);
    const ry = 58 * s + Math.sin(angle) * (5.5 * s);
    fillCircle(rx, ry, 1.8 * s, 0xB7, 0x1C, 0x1C, 255);
  }

  return encodeRGBAtoPNG(size, size, buf);
}

console.log('[Icon Gen] Generating PWA high-res PNG icon assets...');

// Generate standard icons
const icon192 = renderTrishuIcon(192, false);
writeFileSync(resolve(ICONS_DIR, 'icon-192.png'), icon192);
console.log('  ✓ public/icons/icon-192.png (192x192)');

const icon512 = renderTrishuIcon(512, false);
writeFileSync(resolve(ICONS_DIR, 'icon-512.png'), icon512);
console.log('  ✓ public/icons/icon-512.png (512x512)');

const iconMaskable512 = renderTrishuIcon(512, true);
writeFileSync(resolve(ICONS_DIR, 'icon-maskable-512.png'), iconMaskable512);
console.log('  ✓ public/icons/icon-maskable-512.png (512x512 maskable)');

const appleIcon = renderTrishuIcon(180, false);
writeFileSync(resolve(ICONS_DIR, 'apple-touch-icon.png'), appleIcon);
console.log('  ✓ public/icons/apple-touch-icon.png (180x180)');

// Also generate public/icons/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#64C8FA" stroke="#37474F" stroke-width="4"/>
  <circle cx="25" cy="36" r="11" fill="#5D4037"/>
  <circle cx="75" cy="36" r="11" fill="#5D4037"/>
  <circle cx="25" cy="36" r="4.5" fill="#FF5252"/>
  <circle cx="75" cy="36" r="4.5" fill="#FF5252"/>
  <circle cx="50" cy="52" r="26" fill="#FFCC80" stroke="#E65100" stroke-width="3"/>
  <path d="M26,38 Q50,22 74,38" fill="#5D4037"/>
  <circle cx="41" cy="50" r="4" fill="#212121"/>
  <circle cx="59" cy="50" r="4" fill="#212121"/>
  <circle cx="40" cy="48.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="58" cy="48.5" r="1.5" fill="#FFFFFF"/>
  <circle cx="34" cy="58" r="4.5" fill="#FF8A65"/>
  <circle cx="66" cy="58" r="4.5" fill="#FF8A65"/>
  <path d="M43,59 Q50,66 57,59" stroke="#B71C1C" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`;
writeFileSync(resolve(ICONS_DIR, 'icon.svg'), svgContent, 'utf-8');
console.log('  ✓ public/icons/icon.svg (SVG vector)');

console.log('[Icon Gen] All PWA icon assets successfully generated!');
