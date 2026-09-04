/**
 * Automated Unit & E2E Tests for PwaManager & Device Capabilities
 */

import { describe, test, expect, beforeEach, afterEach } from './e2e_runner.mjs';
import { PwaManager } from '../src/pwa/PwaManager';

describe('Tier 5: Heavy PWA & Native Capabilities', () => {
  let pwa: PwaManager;

  beforeEach(() => {
    pwa = PwaManager.getInstance();
  });

  test('T5.01: PwaManager initializes as singleton with default online state', () => {
    expect(pwa).toBeDefined();
    expect(pwa.isOnline()).toBe(true);
    expect(typeof pwa.isStandalone()).toBe('boolean');
  });

  test('T5.02: Handles beforeinstallprompt event and tracks installable state', () => {
    let prompted = false;
    let installableEventFired = false;

    const mockPromptEvent = {
      preventDefault: () => {},
      prompt: async () => { prompted = true; },
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' })
    };

    const unsubscribe = pwa.on('installableChange', (canInstall) => {
      if (canInstall) installableEventFired = true;
    });

    // Simulate browser beforeinstallprompt
    pwa.handleBeforeInstallPrompt(mockPromptEvent as any);

    expect(pwa.isInstallable()).toBe(true);
    expect(installableEventFired).toBe(true);

    unsubscribe();
  });

  test('T5.03: Executes promptInstall and resets installable state on acceptance', async () => {
    let promptCalled = false;

    const mockPromptEvent = {
      preventDefault: () => {},
      prompt: async () => { promptCalled = true; },
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' })
    };

    pwa.handleBeforeInstallPrompt(mockPromptEvent as any);
    expect(pwa.isInstallable()).toBe(true);

    const result = await pwa.promptInstall();
    expect(promptCalled).toBe(true);
    expect(result).toBe('accepted');
    expect(pwa.isInstallable()).toBe(false);
  });

  test('T5.04: Screen Wake Lock requests and releases safely without throwing', async () => {
    let wakeLockReleased = false;

    const mockSentinel = {
      released: false,
      release: async () => {
        mockSentinel.released = true;
        wakeLockReleased = true;
      },
      addEventListener: (_type: string, _cb: any) => {}
    };

    // Inject mock wakeLock
    const origWakeLock = (navigator as any).wakeLock;
    (navigator as any).wakeLock = {
      request: async () => mockSentinel
    };

    const acquired = await pwa.requestWakeLock();
    expect(acquired).toBe(true);
    expect(pwa.hasWakeLock()).toBe(true);

    await pwa.releaseWakeLock();
    expect(wakeLockReleased).toBe(true);
    expect(pwa.hasWakeLock()).toBe(false);

    // Restore
    if (origWakeLock) (navigator as any).wakeLock = origWakeLock;
    else delete (navigator as any).wakeLock;
  });

  test('T5.05: Online and offline event listener updates connectivity state', () => {
    let connectionFired = false;
    let onlineState = true;

    const unsub = pwa.on('connectionChange', (online) => {
      connectionFired = true;
      onlineState = online;
    });

    // Simulate going offline
    (navigator as any).onLine = false;
    window.dispatchEvent(new Event('offline'));
    expect(pwa.isOnline()).toBe(false);
    expect(connectionFired).toBe(true);
    expect(onlineState).toBe(false);

    // Restore online
    (navigator as any).onLine = true;
    window.dispatchEvent(new Event('online'));
    expect(pwa.isOnline()).toBe(true);
    expect(onlineState).toBe(true);

    unsub();
  });

  test('T5.06: Service Worker update notification lifecycle emits updateAvailable', () => {
    let updateFired = false;

    const unsub = pwa.on('updateAvailable', () => {
      updateFired = true;
    });

    pwa.notifyUpdateAvailable({
      waiting: { postMessage: () => {} }
    } as any);

    expect(pwa.hasUpdate()).toBe(true);
    expect(updateFired).toBe(true);

    unsub();
  });
});
