/**
 * Color-by-Shape Game Logic
 * Early-learning shape & color matching coloring game
 * Strictly under 500 lines
 */

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'diamond';

export interface ShapeColorKey {
  kind: ShapeKind;
  color: string;
  label: string;
}

export const SHAPE_COLOR_KEYS: ShapeColorKey[] = [
  { kind: 'circle', color: '#EF5350', label: 'Circle' },
  { kind: 'square', color: '#42A5F5', label: 'Square' },
  { kind: 'triangle', color: '#FFCA28', label: 'Triangle' },
  { kind: 'star', color: '#66BB6A', label: 'Star' },
  { kind: 'diamond', color: '#AB47BC', label: 'Diamond' }
];

export interface ShapePiece {
  id: string;
  kind: ShapeKind;
  nx: number; // normalized 0..1 within paper
  ny: number;
  nsize: number; // normalized radius relative to min(paperW, paperH)
  filled: boolean;
  bounce: number;
}

export interface ShapePicture {
  id: string;
  title: string;
  pieces: Omit<ShapePiece, 'filled' | 'bounce'>[];
}

export const SHAPE_PICTURES: ShapePicture[] = [
  {
    id: 'train',
    title: 'Choo-Choo Train',
    pieces: [
      { id: 'cab', kind: 'square', nx: 0.34, ny: 0.48, nsize: 0.17 },
      { id: 'engine', kind: 'square', nx: 0.56, ny: 0.52, nsize: 0.14 },
      { id: 'nose', kind: 'triangle', nx: 0.72, ny: 0.57, nsize: 0.11 },
      { id: 'roof', kind: 'triangle', nx: 0.34, ny: 0.28, nsize: 0.12 },
      { id: 'wheel1', kind: 'circle', nx: 0.28, ny: 0.72, nsize: 0.09 },
      { id: 'wheel2', kind: 'circle', nx: 0.44, ny: 0.72, nsize: 0.09 },
      { id: 'wheel3', kind: 'circle', nx: 0.60, ny: 0.72, nsize: 0.09 },
      { id: 'puff', kind: 'star', nx: 0.62, ny: 0.24, nsize: 0.10 }
    ]
  },
  {
    id: 'house',
    title: 'Sunny House',
    pieces: [
      { id: 'wall', kind: 'square', nx: 0.48, ny: 0.58, nsize: 0.20 },
      { id: 'roof', kind: 'triangle', nx: 0.48, ny: 0.30, nsize: 0.18 },
      { id: 'sun', kind: 'circle', nx: 0.80, ny: 0.22, nsize: 0.11 },
      { id: 'window', kind: 'diamond', nx: 0.48, ny: 0.56, nsize: 0.09 },
      { id: 'flower1', kind: 'star', nx: 0.20, ny: 0.72, nsize: 0.09 },
      { id: 'flower2', kind: 'star', nx: 0.78, ny: 0.72, nsize: 0.09 }
    ]
  },
  {
    id: 'rocket',
    title: 'Space Rocket',
    pieces: [
      { id: 'body', kind: 'diamond', nx: 0.50, ny: 0.50, nsize: 0.22 },
      { id: 'tip', kind: 'triangle', nx: 0.50, ny: 0.22, nsize: 0.12 },
      { id: 'window', kind: 'circle', nx: 0.50, ny: 0.46, nsize: 0.09 },
      { id: 'finL', kind: 'triangle', nx: 0.32, ny: 0.68, nsize: 0.10 },
      { id: 'finR', kind: 'triangle', nx: 0.68, ny: 0.68, nsize: 0.10 },
      { id: 'star1', kind: 'star', nx: 0.20, ny: 0.26, nsize: 0.09 },
      { id: 'star2', kind: 'star', nx: 0.80, ny: 0.32, nsize: 0.09 },
      { id: 'planet', kind: 'circle', nx: 0.82, ny: 0.72, nsize: 0.10 }
    ]
  },
  {
    id: 'butterfly',
    title: 'Happy Butterfly',
    pieces: [
      { id: 'body', kind: 'diamond', nx: 0.50, ny: 0.54, nsize: 0.16 },
      { id: 'head', kind: 'circle', nx: 0.50, ny: 0.28, nsize: 0.09 },
      { id: 'wingTL', kind: 'circle', nx: 0.30, ny: 0.38, nsize: 0.14 },
      { id: 'wingTR', kind: 'circle', nx: 0.70, ny: 0.38, nsize: 0.14 },
      { id: 'wingBL', kind: 'triangle', nx: 0.32, ny: 0.66, nsize: 0.12 },
      { id: 'wingBR', kind: 'triangle', nx: 0.68, ny: 0.66, nsize: 0.12 },
      { id: 'spotL', kind: 'star', nx: 0.30, ny: 0.38, nsize: 0.07 },
      { id: 'spotR', kind: 'star', nx: 0.70, ny: 0.38, nsize: 0.07 }
    ]
  }
];

export class ColorByShapeLogic {
  public width: number = 960;
  public height: number = 540;
  public pictureIndex: number = 0;
  public selectedKind: ShapeKind = 'circle';
  public hintKind: ShapeKind | null = null;
  public hintTimer: number = 0;
  public pieces: ShapePiece[] = [];
  public score: number = 0;
  public totalShapesColored: number = 0;
  public isCompleted: boolean = false;

  constructor() {
    this.loadPicture(0);
  }

  public get activePicture(): ShapePicture {
    return SHAPE_PICTURES[this.pictureIndex];
  }

  public loadPicture(index: number): void {
    this.pictureIndex = ((index % SHAPE_PICTURES.length) + SHAPE_PICTURES.length) % SHAPE_PICTURES.length;
    this.pieces = this.activePicture.pieces.map(p => ({
      ...p,
      filled: false,
      bounce: 0
    }));
    this.isCompleted = false;
    this.hintKind = null;
    this.hintTimer = 0;
  }

  public nextPicture(): void {
    this.loadPicture(this.pictureIndex + 1);
  }

  public resetPicture(): void {
    this.loadPicture(this.pictureIndex);
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }

  public getPaperBounds(): { x: number; y: number; w: number; h: number } {
    const isPortrait = this.height > this.width;
    const top = isPortrait ? 96 : 56;
    return {
      x: 24,
      y: top,
      w: Math.max(200, this.width - 48),
      h: Math.max(160, this.height - top - 88)
    };
  }

  public tryTapPiece(x: number, y: number): { hit: boolean; matched: boolean; piece?: ShapePiece } {
    const box = this.getPaperBounds();
    const minDim = Math.min(box.w, box.h);

    // Check top-most (last) pieces first
    for (let i = this.pieces.length - 1; i >= 0; i--) {
      const p = this.pieces[i];
      const px = box.x + p.nx * box.w;
      const py = box.y + p.ny * box.h;
      const r = p.nsize * minDim;
      if (Math.hypot(x - px, y - py) <= r * 1.05) {
        if (p.filled) {
          p.bounce = 0.25;
          return { hit: true, matched: false, piece: p };
        }
        if (p.kind === this.selectedKind) {
          p.filled = true;
          p.bounce = 0.4;
          this.score += 15;
          this.totalShapesColored++;
          this.hintKind = null;
          this.isCompleted = this.pieces.every(item => item.filled);
          if (this.isCompleted) {
            this.score += 40;
          }
          return { hit: true, matched: true, piece: p };
        } else {
          // Helpful hint: point to the matching color pot!
          p.bounce = 0.25;
          this.hintKind = p.kind;
          this.hintTimer = 1.5;
          return { hit: true, matched: false, piece: p };
        }
      }
    }
    return { hit: false, matched: false };
  }

  public update(dt: number): void {
    if (this.hintTimer > 0) {
      this.hintTimer = Math.max(0, this.hintTimer - dt);
      if (this.hintTimer === 0) this.hintKind = null;
    }
    for (const p of this.pieces) {
      if (p.bounce > 0) {
        p.bounce = Math.max(0, p.bounce - dt);
      }
    }
  }
}
