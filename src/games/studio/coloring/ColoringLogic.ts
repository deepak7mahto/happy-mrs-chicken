/**
 * Preschool Magic Coloring Book Logic
 * Adventures of Trishu Preschool Suite
 * Strictly under 500 lines
 */

import { ColoringToolMode, CrayonStroke, SheetSaveData, ColoringRegion } from '../types';
import { StudioStorage } from '../studioStorage';
import { COLORING_SHEETS, ColoringSheetDefinition, CRAYON_PALETTE } from './ColoringSheets';

type UndoAction =
  | { type: 'fill'; regionId: string; prevColor: string | undefined }
  | { type: 'stroke'; stroke: CrayonStroke };

export class ColoringLogic {
  public width: number = 960;
  public height: number = 540;
  public sheetIndex: number = 0;
  public toolMode: ColoringToolMode = 'magic';
  public selectedColor: string = CRAYON_PALETTE[0];

  public filledRegions: Record<string, string> = {};
  public strokes: CrayonStroke[] = [];
  public currentStroke: CrayonStroke | null = null;
  public newlyRevealedRegion: string | null = null;

  private undoStack: UndoAction[] = [];

  constructor() {
    this.loadCurrentSheet();
  }

  public get activeSheet(): ColoringSheetDefinition {
    return COLORING_SHEETS[this.sheetIndex];
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }

  public loadCurrentSheet(): void {
    const data: SheetSaveData = StudioStorage.loadColoring(this.activeSheet.id);
    this.filledRegions = { ...data.filledRegions };
    this.strokes = [...data.strokes];
    this.undoStack = [];
    this.currentStroke = null;
  }

  public saveCurrentSheet(): void {
    StudioStorage.saveColoring(this.activeSheet.id, {
      filledRegions: this.filledRegions,
      strokes: this.strokes
    });
  }

  public nextSheet(): void {
    this.saveCurrentSheet();
    this.sheetIndex = (this.sheetIndex + 1) % COLORING_SHEETS.length;
    this.loadCurrentSheet();
  }

  public prevSheet(): void {
    this.saveCurrentSheet();
    this.sheetIndex = (this.sheetIndex - 1 + COLORING_SHEETS.length) % COLORING_SHEETS.length;
    this.loadCurrentSheet();
  }

  public setToolMode(mode: ColoringToolMode): void {
    this.toolMode = mode;
  }

  public setColor(color: string): void {
    this.selectedColor = color;
  }

  public isRegionFilled(regionId: string): boolean {
    return Boolean(this.filledRegions[regionId]);
  }

  public getRegionColor(regionId: string): string | undefined {
    return this.filledRegions[regionId];
  }

  private pointInPolygon(px: number, py: number, poly: Array<{ x: number; y: number }>): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  public hitTestRegion(canvasX: number, canvasY: number): ColoringRegion | null {
    const nx = canvasX / this.width;
    const ny = canvasY / this.height;

    // Check smaller regions first (reverse order)
    const regions = [...this.activeSheet.regions].reverse();
    for (const r of regions) {
      if (this.pointInPolygon(nx, ny, r.polygon)) {
        return r;
      }
    }
    return null;
  }

  public handleTouchMove(canvasX: number, canvasY: number): boolean {
    if (this.toolMode === 'magic') {
      const region = this.hitTestRegion(canvasX, canvasY);
      if (region && !this.filledRegions[region.id]) {
        this.undoStack.push({
          type: 'fill',
          regionId: region.id,
          prevColor: this.filledRegions[region.id]
        });
        this.filledRegions[region.id] = region.colorCanon;
        this.newlyRevealedRegion = region.id;
        this.saveCurrentSheet();
        return true;
      }
    }
    return false;
  }

  public handleTap(canvasX: number, canvasY: number): boolean {
    const region = this.hitTestRegion(canvasX, canvasY);
    if (!region) return false;

    const fillWith = this.toolMode === 'magic' ? region.colorCanon : this.selectedColor;
    if (this.filledRegions[region.id] === fillWith) return false;

    this.undoStack.push({
      type: 'fill',
      regionId: region.id,
      prevColor: this.filledRegions[region.id]
    });
    this.filledRegions[region.id] = fillWith;
    this.newlyRevealedRegion = region.id;
    this.saveCurrentSheet();
    return true;
  }

  public startStroke(x: number, y: number): void {
    if (this.toolMode !== 'crayon') return;
    this.currentStroke = {
      color: this.selectedColor,
      points: [{ x: Math.round(x), y: Math.round(y) }],
      width: 14
    };
  }

  public addStrokePoint(x: number, y: number): void {
    if (!this.currentStroke) return;
    this.currentStroke.points.push({ x: Math.round(x), y: Math.round(y) });
  }

  public endStroke(): void {
    if (!this.currentStroke) return;
    if (this.currentStroke.points.length > 0) {
      this.strokes.push(this.currentStroke);
      this.undoStack.push({ type: 'stroke', stroke: this.currentStroke });
      this.saveCurrentSheet();
    }
    this.currentStroke = null;
  }

  public undo(): boolean {
    const action = this.undoStack.pop();
    if (!action) return false;

    if (action.type === 'fill') {
      if (action.prevColor !== undefined) {
        this.filledRegions[action.regionId] = action.prevColor;
      } else {
        delete this.filledRegions[action.regionId];
      }
    } else if (action.type === 'stroke') {
      this.strokes = this.strokes.filter(s => s !== action.stroke);
    }

    this.saveCurrentSheet();
    return true;
  }

  public clearSheet(): void {
    this.filledRegions = {};
    this.strokes = [];
    this.undoStack = [];
    this.currentStroke = null;
    this.saveCurrentSheet();
  }
}
