/**
 * Mode 19: Rainbow Splat & Stamp Studio - Simulation Logic
 * Headless toddler finger-painting simulation
 * Strictly under 500 lines
 */

import { FingerPaintTool, StampType, PaintColor, PaintSplatItem, SplatDroplet } from './types';

export class FingerPaintLogic {
  public splats: PaintSplatItem[] = [];
  public colorPots: PaintColor[] = [];
  public activeColorIndex: number = 0;
  public activeTool: FingerPaintTool = 'SPLAT';
  public activeStamp: StampType = 'PAW';
  public isSqueegeeActive: boolean = false;
  public squeegeeProgress: number = 0;
  public score: number = 0;
  public totalSplatsMade: number = 0;
  public width: number = 960;
  public height: number = 540;
  private nextSplatId: number = 1;

  public reset(w: number = 960, h: number = 540): void {
    this.width = w;
    this.height = h;
    this.splats = [];
    this.score = 0;
    this.totalSplatsMade = 0;
    this.isSqueegeeActive = false;
    this.squeegeeProgress = 0;
    this.activeColorIndex = 0;
    this.activeTool = 'SPLAT';
    this.activeStamp = 'PAW';
    this.nextSplatId = 1;

    // 5 Vibrant Kid-Friendly Paint Pots
    this.colorPots = [
      { id: 'red', name: 'Cherry Red', hex: '#FF1744', darkHex: '#C51162', lightHex: '#FF80AB', x: 0, y: 0, radius: 28 },
      { id: 'blue', name: 'Ocean Blue', hex: '#2979FF', darkHex: '#1565C0', lightHex: '#82B1FF', x: 0, y: 0, radius: 28 },
      { id: 'yellow', name: 'Sunny Yellow', hex: '#FFEA00', darkHex: '#F57F17', lightHex: '#FFFF8D', x: 0, y: 0, radius: 28 },
      { id: 'green', name: 'Lime Green', hex: '#00E676', darkHex: '#1B5E20', lightHex: '#B9F6CA', x: 0, y: 0, radius: 28 },
      { id: 'purple', name: 'Grape Purple', hex: '#D500F9', darkHex: '#4A148C', lightHex: '#EA80FC', x: 0, y: 0, radius: 28 }
    ];

    this.layout(w, h);
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;

    const isPortrait = h > w;
    const potY = isPortrait ? h * 0.88 : h * 0.88;
    const spacing = w / (this.colorPots.length + 1);

    this.colorPots.forEach((pot, i) => {
      pot.x = spacing * (i + 1);
      pot.y = potY;
    });
  }

  public setColor(index: number): void {
    if (index >= 0 && index < this.colorPots.length) {
      this.activeColorIndex = index;
    }
  }

  public setTool(tool: FingerPaintTool): void {
    this.activeTool = tool;
  }

  public setStamp(stamp: StampType): void {
    this.activeStamp = stamp;
    this.activeTool = 'STAMP';
  }

  public addSplat(x: number, y: number): PaintSplatItem {
    const curColor = this.colorPots[this.activeColorIndex] || this.colorPots[0];
    const baseRadius = 24 + Math.random() * 16;

    // Generate 3-5 satellite droplets for natural splat look
    const droplets: SplatDroplet[] = [];
    const dropletCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < dropletCount; i++) {
      const angle = (Math.PI * 2 / dropletCount) * i + (Math.random() - 0.5) * 0.6;
      const dist = baseRadius * (1.3 + Math.random() * 0.9);
      droplets.push({
        offsetX: Math.cos(angle) * dist,
        offsetY: Math.sin(angle) * dist,
        radius: 4 + Math.random() * 6
      });
    }

    const splat: PaintSplatItem = {
      id: this.nextSplatId++,
      x,
      y,
      radius: baseRadius,
      color: curColor.hex,
      darkColor: curColor.darkHex,
      type: 'SPLAT',
      droplets,
      scale: 1.0
    };

    // Keep max 150 splats to avoid unbounded memory
    if (this.splats.length >= 150) {
      this.splats.shift();
    }
    this.splats.push(splat);
    this.totalSplatsMade++;
    this.score += 5;
    return splat;
  }

  public addStamp(x: number, y: number): PaintSplatItem {
    const curColor = this.colorPots[this.activeColorIndex] || this.colorPots[0];
    const stamp: PaintSplatItem = {
      id: this.nextSplatId++,
      x,
      y,
      radius: 32,
      color: curColor.hex,
      darkColor: curColor.darkHex,
      type: 'STAMP',
      stampType: this.activeStamp,
      droplets: [],
      scale: 1.0
    };

    if (this.splats.length >= 150) {
      this.splats.shift();
    }
    this.splats.push(stamp);
    this.totalSplatsMade++;
    this.score += 10;
    return stamp;
  }

  public triggerSqueegee(): void {
    if (this.isSqueegeeActive) return;
    this.isSqueegeeActive = true;
    this.squeegeeProgress = 0;
  }

  public findColorPotAt(x: number, y: number): number {
    return this.colorPots.findIndex(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.hypot(dx, dy) <= p.radius * 1.4;
    });
  }

  public update(dt: number): { squeegeeFinished: boolean; wipedSplats: number } {
    let squeegeeFinished = false;
    let wipedSplats = 0;

    if (this.isSqueegeeActive) {
      this.squeegeeProgress += dt / 0.8; // Takes 0.8s to sweep canvas
      if (this.squeegeeProgress >= 1.0) {
        wipedSplats = this.splats.length;
        this.splats = [];
        this.isSqueegeeActive = false;
        this.squeegeeProgress = 0;
        squeegeeFinished = true;
      }
    }

    return { squeegeeFinished, wipedSplats };
  }
}
