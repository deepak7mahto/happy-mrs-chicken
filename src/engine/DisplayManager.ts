export class DisplayManager {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public vWidth: number = 960;
  public vHeight: number = 540;
  public targetAspect: number = 960 / 540;
  public isPortrait: boolean = false;

  private _scale: number = 1.0;
  private _offsetX: number = 0;
  private _offsetY: number = 0;
  private _dpr: number = 1.0;
  private _windowWidth: number = window.innerWidth;
  private _windowHeight: number = window.innerHeight;
  public letterboxColor: string = '#0f172a';

  private resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Failed to get 2D canvas context');
    this.ctx = context;

    this.resizeHandler = () => this.syncResize();
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
    this.syncResize();
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('orientationchange', this.resizeHandler);
  }

  get scale(): number {
    this.checkDimensionChange();
    return this._scale;
  }
  set scale(v: number) { this._scale = v; }

  get offsetX(): number {
    this.checkDimensionChange();
    return this._offsetX;
  }
  set offsetX(v: number) { this._offsetX = v; }

  get offsetY(): number {
    this.checkDimensionChange();
    return this._offsetY;
  }
  set offsetY(v: number) { this._offsetY = v; }

  get dpr(): number {
    this.checkDimensionChange();
    return this._dpr;
  }
  set dpr(v: number) { this._dpr = v; }

  get windowWidth(): number {
    this.checkDimensionChange();
    return this._windowWidth;
  }
  set windowWidth(v: number) { this._windowWidth = v; }

  get windowHeight(): number {
    this.checkDimensionChange();
    return this._windowHeight;
  }
  set windowHeight(v: number) { this._windowHeight = v; }

  checkDimensionChange(): void {
    if (this._windowWidth !== window.innerWidth || this._windowHeight !== window.innerHeight) {
      this.syncResize();
    }
  }

  syncResize(): void {
    this._windowWidth = window.innerWidth;
    this._windowHeight = window.innerHeight;
    this._dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.isPortrait = this._windowHeight > this._windowWidth;
    if (this.isPortrait) {
      // In portrait: horizontal reference is 540 virtual pixels
      this._scale = this._windowWidth / 540;
      this.vWidth = 540;
      this.vHeight = Math.max(800, Math.round(this._windowHeight / this._scale));
      this._offsetX = 0;
      this._offsetY = 0;
    } else {
      // In landscape: vertical reference is 540 virtual pixels
      this._scale = this._windowHeight / 540;
      this.vHeight = 540;
      this.vWidth = Math.max(960, Math.round(this._windowWidth / this._scale));
      this._offsetX = 0;
      this._offsetY = 0;
    }
    this.targetAspect = this.vWidth / this.vHeight;

    if (this.canvas) {
      this.canvas.width = Math.max(1, Math.floor(this._windowWidth * this._dpr));
      this.canvas.height = Math.max(1, Math.floor(this._windowHeight * this._dpr));
      this.canvas.style.width = `${this._windowWidth}px`;
      this.canvas.style.height = `${this._windowHeight}px`;
    }
  }

  resize(): void {
    this.syncResize();
  }

  beginFrame(): void {
    this.checkDimensionChange();
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this._dpr, this._dpr);
    ctx.scale(this._scale, this._scale);
  }

  endFrame(): void {
    this.ctx.restore();
  }

  screenToVirtual(screenX: number, screenY: number): { x: number; y: number; inside: boolean } {
    this.checkDimensionChange();
    const vx = screenX / this._scale;
    const vy = screenY / this._scale;
    const inside = vx >= 0 && vx <= this.vWidth && vy >= 0 && vy <= this.vHeight;
    return { x: vx, y: vy, inside };
  }

  virtualToScreen(vx: number, vy: number): { screenX: number; screenY: number } {
    this.checkDimensionChange();
    return {
      screenX: vx * this._scale,
      screenY: vy * this._scale
    };
  }
}
