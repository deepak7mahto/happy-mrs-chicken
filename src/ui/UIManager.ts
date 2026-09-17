/**
 * UI Manager - Coordinates HUD and all Overlay Modals
 * Adventures of Trishu Mini-Game Suite
 * Pure Vanilla TypeScript - Decoupled Architecture
 * Strictly under 500 lines
 */

import { GameEngine } from '../engine/GameEngine';
import { HUD } from './HUD';
import { SettingsModal } from './SettingsModal';
import { AvatarSelectModal } from './AvatarSelectModal';
import { PassportModal } from './PassportModal';
import { StoryIntroModal } from './StoryIntroModal';
import { StoryVictoryModal } from './StoryVictoryModal';
import { PwaUI } from './PwaModal';
import { TapFeedback } from './TapFeedback';
import { GameModeId } from '../types/game';
import { STORY_STOPS } from '../story/storyData';

export class UIManager {
  public hud: HUD;
  public settingsModal: SettingsModal;
  public avatarModal: AvatarSelectModal;
  public passportModal: PassportModal;
  public storyIntroModal: StoryIntroModal;
  public storyVictoryModal: StoryVictoryModal;
  public pwaUI: PwaUI;
  public tapFeedback: TapFeedback;

  private engine: GameEngine;
  private container: HTMLElement;

  constructor(engine: GameEngine, container: HTMLElement = document.body) {
    this.engine = engine;
    this.container = container;

    this.settingsModal = new SettingsModal(this.engine.storage);
    this.avatarModal = new AvatarSelectModal(this.engine);
    this.passportModal = new PassportModal(this.engine.storage);
    this.storyIntroModal = new StoryIntroModal();
    this.storyVictoryModal = new StoryVictoryModal();
    this.pwaUI = new PwaUI(this.container);
    this.tapFeedback = new TapFeedback(this.container);

    this.hud = new HUD(
      this.engine,
      {
        onGoHome: () => this.engine.changeScene('MENU'),
        onToggleMute: () => {
          const newMute = !this.engine.storage.isMuted();
          this.engine.storage.setMuted(newMute);
          this.hud.render();
        },
        onToggleFullscreen: () => this.engine.toggleFullscreen(),
        onOpenSettings: () => this.settingsModal.open(this.container, () => this.hud.render()),
        onOpenAvatarSelect: () => this.avatarModal.open(this.container, () => this.hud.render(), () => this.hud.render()),
        onOpenPassport: () => this.passportModal.open(this.container, (stopIdx) => this.engine.launchStoryStop(stopIdx)),
        onOpenInstall: () => this.pwaUI.openInstallModal(this.container)
      },
      this.container
    );

    // Wire Story Engine hooks
    this.engine.onStoryIntroCallback = (stopIndex: number) => {
      const stop = STORY_STOPS[stopIndex];
      if (stop) {
        this.storyIntroModal.open(stop, this.container);
      }
    };

    this.engine.onStoryVictoryCallback = (
      stopIndex: number,
      score: number,
      stars: number,
      isNewStamp: boolean,
      unlockedAccessory?: string
    ) => {
      const stop = STORY_STOPS[stopIndex];
      if (!stop) return;
      const hasNext = stopIndex < STORY_STOPS.length - 1;

      this.storyVictoryModal.open(
        stop,
        score,
        stars,
        isNewStamp,
        hasNext,
        this.container,
        {
          onNext: () => this.engine.launchStoryStop(stopIndex + 1),
          onReplay: () => this.engine.launchStoryStop(stopIndex, false),
          onBackToMap: () => this.engine.changeScene('MENU')
        },
        unlockedAccessory
      );
    };

    this.engine.onSceneChangeCallback = (mode: GameModeId) => {
      this.hud.updateMode(mode);
    };
  }

  public destroy(): void {
    this.hud.destroy();
    this.tapFeedback.destroy();
  }
}
