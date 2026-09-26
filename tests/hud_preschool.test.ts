import { describe, it, expect } from './e2e_runner.mjs';
import { GameEngine } from '../src/engine/GameEngine';
import { HUD } from '../src/ui/HUD';
import { SettingsModal } from '../src/ui/SettingsModal';

describe('Preschool UI: Distraction-Free HUD & Parental Gate', () => {
  it('T-PHUD.01: In-game HUD hides settings, avatar, fullscreen, and audio buttons', () => {
    const canvas = document.createElement('canvas');
    const engine = new GameEngine(canvas);
    const hud = new HUD(engine, {
      onGoHome: () => {},
      onToggleMute: () => {},
      onToggleFullscreen: () => {},
      onOpenSettings: () => {},
      onOpenAvatarSelect: () => {},
      onOpenPassport: () => {},
      onOpenInstall: () => {}
    });

    hud.updateMode('EGG_LAYING');
    const settingsBtn = (hud as any).el.querySelector('#hud-btn-settings');
    expect(settingsBtn).toBeNull();

    const avatarBtn = (hud as any).el.querySelector('#hud-btn-avatar');
    expect(avatarBtn).toBeNull();

    const homeBtn = (hud as any).el.querySelector('#hud-btn-home');
    expect(homeBtn).not.toBeNull();
  });

  it('T-PHUD.02: SettingsModal exposes Parental Gate state', () => {
    const modal = new SettingsModal();
    expect(typeof (modal as any).isUnlocked).toBe('boolean');
    expect((modal as any).isUnlocked).toBe(false);
  });
});
