/**
 * Toddler Tap Feedback System
 * Adventures of Trishu Mini-Game Suite
 * Pure Vanilla TypeScript - Zero React
 * Spawns joyful floating emojis on pointer taps
 */

const TODDLER_EMOJIS = ['✨', '🐣', '⭐', '🎈', '💖', '🥚', '🌸', '🦖', '🐷'];

export class TapFeedback {
  private container: HTMLElement;
  private pointerHandler: (e: PointerEvent) => void;

  constructor(parent: HTMLElement = document.body) {
    this.container = document.createElement('div');
    this.container.className = 'tap-feedback-overlay';
    parent.appendChild(this.container);

    this.pointerHandler = (e: PointerEvent) => this.handlePointerDown(e);
    window.addEventListener('pointerdown', this.pointerHandler, { passive: true });
  }

  private handlePointerDown(e: PointerEvent): void {
    const emoji = TODDLER_EMOJIS[Math.floor(Math.random() * TODDLER_EMOJIS.length)];
    const el = document.createElement('div');
    el.className = 'tap-feedback-emoji';
    el.style.left = `${e.clientX}px`;
    el.style.top = `${e.clientY}px`;
    el.textContent = emoji;

    this.container.appendChild(el);

    setTimeout(() => {
      if (el.parentNode === this.container) {
        this.container.removeChild(el);
      }
    }, 700);
  }

  public destroy(): void {
    window.removeEventListener('pointerdown', this.pointerHandler);
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
