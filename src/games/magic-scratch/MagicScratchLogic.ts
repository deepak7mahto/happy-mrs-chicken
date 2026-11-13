/**
 * Magic Scratch-to-Reveal Rainbow Art Logic
 * Tracks scratch strokes, reveal progress grid, and picture themes
 * Strictly under 500 lines
 */

export interface ScratchPicture {
  id: string;
  title: string;
  foilColor: string;
  foilAccent: string;
  bgGradient: [string, string];
}

export const SCRATCH_PICTURES: ScratchPicture[] = [
  { id: 'rainbow_castle', title: 'Rainbow Castle', foilColor: '#5C6BC0', foilAccent: '#7986CB', bgGradient: ['#FF80AB', '#FFD54F'] },
  { id: 'happy_clucky', title: 'Happy Mrs Clucky', foilColor: '#7E57C2', foilAccent: '#9575CD', bgGradient: ['#4FC3F7', '#AED581'] },
  { id: 'friendly_dino', title: 'Friendly Dino', foilColor: '#26A69A', foilAccent: '#4DB6AC', bgGradient: ['#FFE082', '#81C784'] },
  { id: 'space_rocket', title: 'Space Rocket', foilColor: '#37474F', foilAccent: '#546E7A', bgGradient: ['#7C4DFF', '#40C4FF'] },
  { id: 'ocean_whale', title: 'Ocean Whale', foilColor: '#0288D1', foilAccent: '#29B6F6', bgGradient: ['#80DEEA', '#FFF59D'] }
];

export interface ScratchPoint {
  x: number;
  y: number;
}

const GRID_COLS = 24;
const GRID_ROWS = 14;
const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

export class MagicScratchLogic {
  public width: number = 960;
  public height: number = 540;
  public pictureIndex: number = 0;
  public brushRadius: number = 34;
  public score: number = 0;
  public totalRevealedPictures: number = 0;
  public isCompleted: boolean = false;
  public celebrationTimer: number = 0;
  public needsMaskReset: boolean = true;
  public pendingStrokes: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  private grid: Uint8Array = new Uint8Array(TOTAL_CELLS);
  private revealedCells: number = 0;
  private lastPoint: ScratchPoint | null = null;

  public get activePicture(): ScratchPicture {
    return SCRATCH_PICTURES[this.pictureIndex];
  }

  public get revealPercent(): number {
    return Math.min(100, Math.round((this.revealedCells / TOTAL_CELLS) * 100));
  }

  public reset(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.resetCard();
  }

  public layout(w: number, h: number): void {
    if (this.width !== w || this.height !== h) {
      this.width = w;
      this.height = h;
      this.needsMaskReset = true;
    }
  }

  public resetCard(): void {
    this.grid.fill(0);
    this.revealedCells = 0;
    this.isCompleted = false;
    this.celebrationTimer = 0;
    this.lastPoint = null;
    this.pendingStrokes = [];
    this.needsMaskReset = true;
  }

  public nextPicture(): void {
    this.pictureIndex = (this.pictureIndex + 1) % SCRATCH_PICTURES.length;
    this.resetCard();
  }

  public prevPicture(): void {
    this.pictureIndex = (this.pictureIndex - 1 + SCRATCH_PICTURES.length) % SCRATCH_PICTURES.length;
    this.resetCard();
  }

  public getPaperBounds(): { x: number; y: number; w: number; h: number } {
    return {
      x: 24,
      y: 62,
      w: Math.max(200, this.width - 48),
      h: Math.max(160, this.height - 144)
    };
  }

  public startScratch(x: number, y: number): boolean {
    this.lastPoint = { x, y };
    return this.scratchAt(x, y, x, y);
  }

  public moveScratch(x: number, y: number): boolean {
    const prev = this.lastPoint || { x, y };
    this.lastPoint = { x, y };
    return this.scratchAt(prev.x, prev.y, x, y);
  }

  public endScratch(): void {
    this.lastPoint = null;
  }

  private scratchAt(x1: number, y1: number, x2: number, y2: number): boolean {
    const box = this.getPaperBounds();
    if (
      x2 < box.x - this.brushRadius ||
      x2 > box.x + box.w + this.brushRadius ||
      y2 < box.y - this.brushRadius ||
      y2 > box.y + box.h + this.brushRadius
    ) {
      return false;
    }

    this.pendingStrokes.push({ x1, y1, x2, y2 });

    // Mark grid cells covered by brush
    const nx = (x2 - box.x) / box.w;
    const ny = (y2 - box.y) / box.h;
    const rx = Math.max(1, Math.ceil((this.brushRadius / box.w) * GRID_COLS));
    const ry = Math.max(1, Math.ceil((this.brushRadius / box.h) * GRID_ROWS));
    const cx = Math.floor(nx * GRID_COLS);
    const cy = Math.floor(ny * GRID_ROWS);

    let newlyScratched = 0;
    for (let gy = Math.max(0, cy - ry); gy <= Math.min(GRID_ROWS - 1, cy + ry); gy++) {
      for (let gx = Math.max(0, cx - rx); gx <= Math.min(GRID_COLS - 1, cx + rx); gx++) {
        const idx = gy * GRID_COLS + gx;
        if (this.grid[idx] === 0) {
          this.grid[idx] = 1;
          this.revealedCells++;
          newlyScratched++;
        }
      }
    }

    if (newlyScratched > 0) {
      this.score += newlyScratched * 2;
    }

    if (!this.isCompleted && this.revealPercent >= 75) {
      this.isCompleted = true;
      this.celebrationTimer = 3.0;
      this.totalRevealedPictures++;
      this.score += 50;
      return true;
    }

    return newlyScratched > 0;
  }

  public update(dt: number): void {
    if (this.celebrationTimer > 0) {
      this.celebrationTimer = Math.max(0, this.celebrationTimer - dt);
    }
  }
}
