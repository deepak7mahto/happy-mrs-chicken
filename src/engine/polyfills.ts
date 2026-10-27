/**
 * Browser Polyfills & Compatibility Layer
 * Adventures of Trishu Mini-Game Suite
 * Ensures full support for iOS 15 Safari (iPhone 7 / SE1 / iPad Air 2 / older WebKit)
 */

declare global {
  interface CanvasRenderingContext2D {
    roundRect(
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | number[] | DOMPointInit | (number | DOMPointInit)[]
    ): CanvasRenderingContext2D;
  }
  interface Path2D {
    roundRect(
      x: number,
      y: number,
      w: number,
      h: number,
      radii?: number | number[] | DOMPointInit | (number | DOMPointInit)[]
    ): void;
  }
}

function normalizeRadii(radii: number | number[] | unknown, w: number, h: number): [number, number, number, number] {
  const maxR = Math.min(Math.abs(w) / 2, Math.abs(h) / 2);
  if (typeof radii === 'number') {
    const r = Math.max(0, Math.min(radii, maxR));
    return [r, r, r, r];
  }
  if (Array.isArray(radii)) {
    if (radii.length === 0) return [0, 0, 0, 0];
    const extractNum = (v: unknown): number => {
      if (typeof v === 'number') return Math.max(0, Math.min(v, maxR));
      if (v && typeof (v as { x?: number }).x === 'number') return Math.max(0, Math.min((v as { x: number }).x, maxR));
      return 0;
    };
    if (radii.length === 1) {
      const r = extractNum(radii[0]);
      return [r, r, r, r];
    }
    if (radii.length === 2) {
      const r1 = extractNum(radii[0]);
      const r2 = extractNum(radii[1]);
      return [r1, r2, r1, r2];
    }
    if (radii.length === 3) {
      const r1 = extractNum(radii[0]);
      const r2 = extractNum(radii[1]);
      const r3 = extractNum(radii[2]);
      return [r1, r2, r3, r2];
    }
    return [extractNum(radii[0]), extractNum(radii[1]), extractNum(radii[2]), extractNum(radii[3])];
  }
  return [0, 0, 0, 0];
}

function polyfillRoundRect(targetProto: CanvasRenderingContext2D | Path2D): void {
  if (!targetProto || typeof (targetProto as unknown as { roundRect?: unknown }).roundRect === 'function') {
    return;
  }

  (targetProto as unknown as { roundRect: unknown }).roundRect = function(
    this: CanvasRenderingContext2D | Path2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | number[] | unknown
  ) {
    if (w === 0 || h === 0) {
      this.rect(x, y, w, h);
      return this;
    }

    let rx = x;
    let ry = y;
    let rw = w;
    let rh = h;

    if (rw < 0) {
      rx += rw;
      rw = Math.abs(rw);
    }
    if (rh < 0) {
      ry += rh;
      rh = Math.abs(rh);
    }

    const [tl, tr, br, bl] = normalizeRadii(radii, rw, rh);

    this.moveTo(rx + tl, ry);
    this.arcTo(rx + rw, ry, rx + rw, ry + rh, tr);
    this.arcTo(rx + rw, ry + rh, rx, ry + rh, br);
    this.arcTo(rx, ry + rh, rx, ry, bl);
    this.arcTo(rx, ry, rx + rw, ry, tl);
    this.closePath();

    return this;
  };
}

export function initPolyfills(): void {
  if (typeof window === 'undefined') return;

  if (typeof CanvasRenderingContext2D !== 'undefined') {
    polyfillRoundRect(CanvasRenderingContext2D.prototype);
  }
  if (typeof Path2D !== 'undefined') {
    polyfillRoundRect(Path2D.prototype);
  }
}

// Auto-execute on module evaluation
initPolyfills();
