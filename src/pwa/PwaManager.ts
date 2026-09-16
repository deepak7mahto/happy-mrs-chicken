/**
 * Adventures of Trishu - Centralized Native Device & Heavy PWA Manager
 */

export type PwaEventType =
  | 'installableChange'
  | 'installed'
  | 'updateAvailable'
  | 'connectionChange'
  | 'wakeLockChange';

export type PwaEventDataMap = {
  installableChange: boolean;
  installed: void;
  updateAvailable: void;
  connectionChange: boolean;
  wakeLockChange: boolean;
};

interface WakeLockSentinelLike {
  release: () => Promise<void>;
  released?: boolean;
  addEventListener?: (name: string, cb: () => void) => void;
}

export type PwaEventListener<E extends PwaEventType = PwaEventType> = (data: PwaEventDataMap[E]) => void;

export type PwaGenericListener = (data?: unknown) => void;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export class PwaManager {
  private static instance: PwaManager | null = null;

  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private wakeLockSentinel: WakeLockSentinelLike | null = null;
  private shouldKeepWakeLock: boolean = false;
  private waitingServiceWorker: ServiceWorker | null = null;
  private updatePending: boolean = false;
  private listeners: Map<PwaEventType, Set<PwaGenericListener>> = new Map();

  private constructor() {
    this.initListeners();
  }

  public static getInstance(): PwaManager {
    if (!PwaManager.instance) {
      PwaManager.instance = new PwaManager();
    }
    return PwaManager.instance;
  }

  private initListeners(): void {
    if (typeof window === 'undefined') return;

    // 1. Intercept beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      this.handleBeforeInstallPrompt(e as BeforeInstallPromptEvent);
    });

    // 2. Track appinstalled event
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.emit('installed');
      this.emit('installableChange', false);
    });

    // 3. Online/Offline network monitoring
    window.addEventListener('online', () => {
      this.emit('connectionChange', true);
    });
    window.addEventListener('offline', () => {
      this.emit('connectionChange', false);
    });

    // 4. Page Visibility Change for Screen Wake Lock recovery
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && this.shouldKeepWakeLock) {
          await this.acquireWakeLock();
        }
      });
    }
  }

  // --- Network Status ---
  public isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
  }

  // --- Standalone & Device Detection ---
  public isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const isStandaloneMQ = window.matchMedia?.('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean })?.standalone === true;
    return Boolean(isStandaloneMQ || isIOSStandalone);
  }

  public isIOS(): boolean {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown })?.MSStream;
  }

  public isInstallable(): boolean {
    return !this.isStandalone() && this.deferredPrompt !== null;
  }

  public canShowInstallUI(): boolean {
    if (this.isStandalone()) return false;
    return this.isInstallable() || this.isIOS();
  }

  // --- Install Prompt Handling ---
  public handleBeforeInstallPrompt(event: BeforeInstallPromptEvent): void {
    if (typeof event?.preventDefault === 'function') {
      event.preventDefault();
    }
    this.deferredPrompt = event;
    this.emit('installableChange', true);
  }

  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'unsupported'> {
    if (!this.deferredPrompt) {
      return 'unsupported';
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.emit('installableChange', false);
        this.emit('installed');
      }
      return choice.outcome;
    } catch (err) {
      console.warn('[PWA] promptInstall failed:', err);
      return 'unsupported';
    }
  }

  // --- Screen Wake Lock Management ---
  public async requestWakeLock(): Promise<boolean> {
    this.shouldKeepWakeLock = true;
    return this.acquireWakeLock();
  }

  private async acquireWakeLock(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
        return true;
      }

      this.wakeLockSentinel = await (navigator as unknown as {
        wakeLock: { request: (type: string) => Promise<WakeLockSentinelLike> }
      }).wakeLock.request('screen');
      this.wakeLockSentinel.addEventListener?.('release', () => {
        this.emit('wakeLockChange', false);
      });

      this.emit('wakeLockChange', true);
      return true;
    } catch (err) {
      // Browsers may deny wakelock if low battery or hidden tab
      return false;
    }
  }

  public async releaseWakeLock(): Promise<void> {
    this.shouldKeepWakeLock = false;
    if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
      try {
        await this.wakeLockSentinel.release();
      } catch (_) {}
      this.wakeLockSentinel = null;
      this.emit('wakeLockChange', false);
    }
  }

  public hasWakeLock(): boolean {
    return Boolean(this.wakeLockSentinel && !this.wakeLockSentinel.released);
  }

  // --- Service Worker Updates & Lifecycle ---
  public notifyUpdateAvailable(registration: ServiceWorkerRegistration): void {
    if (registration.waiting) {
      this.waitingServiceWorker = registration.waiting;
    }
    this.updatePending = true;
    this.emit('updateAvailable');
  }

  public hasUpdate(): boolean {
    return this.updatePending;
  }

  public skipWaitingAndReload(): void {
    if (this.waitingServiceWorker) {
      this.waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      });
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  // --- Event Emitter ---
  public on<E extends PwaEventType>(event: E, listener: PwaEventListener<E>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as unknown as PwaGenericListener);
    return () => this.off(event, listener);
  }

  public off<E extends PwaEventType>(event: E, listener: PwaEventListener<E>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener as unknown as PwaGenericListener);
    }
  }

  private emit<E extends PwaEventType>(event: E, data?: PwaEventDataMap[E]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const listener of set) {
        try {
          listener(data);
        } catch (err) {
          console.error(`[PWA] Error in event listener for ${event}:`, err);
        }
      }
    }
  }
}

export const pwaManager = PwaManager.getInstance();
