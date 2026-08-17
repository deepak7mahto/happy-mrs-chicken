export class GameLoop {
  private updateFn: (dt: number, isPaused: boolean) => void;
  private renderFn: (alpha: number) => void;
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedDt: number = 1 / 60;
  private rafId: number | null = null;

  public fpsMonitor = {
    frames: 0,
    lastFpsUpdate: 0,
    currentFPS: 60,
    avgFPS: 60,
    minFps: 60,
    droppedFrames: 0,
    history: [] as number[]
  };

  constructor(
    updateFn: (dt: number, isPaused: boolean) => void,
    renderFn: (alpha: number) => void
  ) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.tick = this.tick.bind(this);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.fpsMonitor.lastFpsUpdate = this.lastTime;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick(now: number): void {
    if (!this.isRunning) return;

    let frameTime = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (frameTime > 0.25) frameTime = 0.25;

    // Track FPS
    this.fpsMonitor.frames++;
    if (now - this.fpsMonitor.lastFpsUpdate >= 1000) {
      this.fpsMonitor.currentFPS = this.fpsMonitor.frames;
      this.fpsMonitor.history.push(this.fpsMonitor.currentFPS);
      if (this.fpsMonitor.history.length > 30) this.fpsMonitor.history.shift();

      const sum = this.fpsMonitor.history.reduce((a, b) => a + b, 0);
      this.fpsMonitor.avgFPS = Math.round(sum / this.fpsMonitor.history.length);
      this.fpsMonitor.minFps = Math.min(...this.fpsMonitor.history);
      this.fpsMonitor.frames = 0;
      this.fpsMonitor.lastFpsUpdate = now;
    }

    this.accumulator += frameTime;
    while (this.accumulator >= this.fixedDt) {
      this.updateFn(this.fixedDt, this.isPaused);
      this.accumulator -= this.fixedDt;
    }

    const alpha = this.accumulator / this.fixedDt;
    this.renderFn(alpha);

    this.rafId = requestAnimationFrame(this.tick);
  }
}
