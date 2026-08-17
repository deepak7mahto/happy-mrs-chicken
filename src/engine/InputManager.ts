import { DisplayManager } from './DisplayManager';
import { soundEngine } from './SoundEngine';
import { PointerData } from '../types/game';

export class InputManager {
  private display: DisplayManager;
  public pointers: Map<number, PointerData> = new Map();
  public keysDown: Set<string> = new Set();
  public keysJustPressed: Set<string> = new Set();
  public keysJustReleased: Set<string> = new Set();

  public actionJustPressed: boolean = false;
  public actionIsDown: boolean = false;
  public actionJustReleased: boolean = false;
  public primaryPointer: { x: number; y: number; isDown: boolean; inside: boolean } = {
    x: 480,
    y: 270,
    isDown: false,
    inside: true
  };

  private _listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private _boundOnPointerDown: (e: PointerEvent) => void;
  private _boundOnPointerMove: (e: PointerEvent) => void;
  private _boundOnPointerUp: (e: PointerEvent) => void;
  private _boundOnKeyDown: (e: KeyboardEvent) => void;
  private _boundOnKeyUp: (e: KeyboardEvent) => void;

  constructor(displayManager: DisplayManager) {
    this.display = displayManager;
    this._boundOnPointerDown = this._onPointerDown.bind(this);
    this._boundOnPointerMove = this._onPointerMove.bind(this);
    this._boundOnPointerUp = this._onPointerUp.bind(this);
    this._boundOnKeyDown = this._onKeyDown.bind(this);
    this._boundOnKeyUp = this._onKeyUp.bind(this);
    this.attach();
  }

  attach(): void {
    const canvas = this.display.canvas;
    canvas.addEventListener('pointerdown', this._boundOnPointerDown, { passive: false });
    window.addEventListener('pointermove', this._boundOnPointerMove, { passive: false });
    window.addEventListener('pointerup', this._boundOnPointerUp, { passive: false });
    window.addEventListener('pointercancel', this._boundOnPointerUp, { passive: false });
    window.addEventListener('keydown', this._boundOnKeyDown, { passive: false });
    window.addEventListener('keyup', this._boundOnKeyUp, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  detach(): void {
    const canvas = this.display.canvas;
    canvas.removeEventListener('pointerdown', this._boundOnPointerDown);
    window.removeEventListener('pointermove', this._boundOnPointerMove);
    window.removeEventListener('pointerup', this._boundOnPointerUp);
    window.removeEventListener('pointercancel', this._boundOnPointerUp);
    window.removeEventListener('keydown', this._boundOnKeyDown);
    window.removeEventListener('keyup', this._boundOnKeyUp);
  }

  private _unlockAudio(): void {
    soundEngine.unlock();
  }

  private _onPointerDown(e: PointerEvent): void {
    if (typeof e.clientX !== 'number' || !isFinite(e.clientX) || typeof e.clientY !== 'number' || !isFinite(e.clientY)) {
      return;
    }
    if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
    this._unlockAudio();

    const vPos = this.display.screenToVirtual(e.clientX, e.clientY);
    if (!isFinite(vPos.x) || !isFinite(vPos.y)) return;
    const ptrId = e.pointerId !== undefined ? e.pointerId : 1;
    const pointerData: PointerData = {
      id: ptrId,
      screenX: e.clientX,
      screenY: e.clientY,
      x: vPos.x,
      y: vPos.y,
      inside: vPos.inside,
      isDown: true,
      justPressed: true,
      justReleased: false
    };

    this.pointers.set(ptrId, pointerData);
    this.primaryPointer = { x: vPos.x, y: vPos.y, isDown: true, inside: vPos.inside };
    this.actionJustPressed = true;
    this.actionIsDown = true;
    this.emit('pointerdown', pointerData);
    this.emit('tap', vPos);
  }

  private _onPointerMove(e: PointerEvent): void {
    const ptrId = e.pointerId !== undefined ? e.pointerId : 1;
    if (this.pointers.has(ptrId)) {
      const vPos = this.display.screenToVirtual(e.clientX, e.clientY);
      const p = this.pointers.get(ptrId)!;
      p.screenX = e.clientX;
      p.screenY = e.clientY;
      p.x = vPos.x;
      p.y = vPos.y;
      p.inside = vPos.inside;
      this.primaryPointer = { x: vPos.x, y: vPos.y, isDown: true, inside: vPos.inside };
      this.emit('pointermove', p);
    }
  }

  private _onPointerUp(e: PointerEvent): void {
    const ptrId = e.pointerId !== undefined ? e.pointerId : 1;
    if (this.pointers.has(ptrId)) {
      const vPos = this.display.screenToVirtual(e.clientX, e.clientY);
      const p = this.pointers.get(ptrId)!;
      p.isDown = false;
      p.justReleased = true;
      this.emit('pointerup', p);
      this.pointers.delete(ptrId);
    } else {
      this.pointers.clear();
    }

    if (this.pointers.size === 0) {
      this.actionIsDown = this.keysDown.has('Space') || this.keysDown.has('Enter');
      this.actionJustReleased = true;
      this.primaryPointer.isDown = false;
    }
  }

  private _onKeyDown(e: KeyboardEvent): void {
    this._unlockAudio();
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) || e.key === ' ') {
      if (e.cancelable && typeof e.preventDefault === 'function') e.preventDefault();
    }
    if (!this.keysDown.has(e.code)) {
      this.keysJustPressed.add(e.code);
    }
    this.keysDown.add(e.code);

    if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ') {
      this.actionJustPressed = true;
      this.actionIsDown = true;
    }
  }

  private _onKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.code);
    this.keysJustReleased.add(e.code);

    if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ') {
      if (this.pointers.size === 0) {
        this.actionIsDown = false;
        this.actionJustReleased = true;
      }
    }
  }

  isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  isKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }

  isActionJustPressed(): boolean {
    return this.actionJustPressed;
  }

  on(eventName: string, callback: (data: unknown) => void): void {
    if (!this._listeners.has(eventName)) this._listeners.set(eventName, []);
    this._listeners.get(eventName)!.push(callback);
  }

  emit(eventName: string, data: unknown): void {
    const list = this._listeners.get(eventName);
    if (list) {
      for (const fn of list) {
        try { fn(data); } catch (err) { console.error('Input listener error:', err); }
      }
    }
  }

  postUpdate(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.actionJustPressed = false;
    this.actionJustReleased = false;
    for (const p of this.pointers.values()) {
      p.justPressed = false;
      p.justReleased = false;
    }
  }
}
