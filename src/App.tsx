import React, { useState, useCallback, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ToddlerTapFeedback } from './components/ToddlerTapFeedback';
import { PwaInstallModal } from './components/PwaInstallModal';
import { PwaUpdateToast } from './components/PwaUpdateToast';
import { PwaOfflinePill } from './components/PwaOfflinePill';
import { SettingsModal } from './components/SettingsModal';
import { AvatarSelectModal } from './components/AvatarSelectModal';
import { StoryIntroModal } from './components/StoryIntroModal';
import { StoryVictoryModal } from './components/StoryVictoryModal';
import { PassportModal } from './components/PassportModal';
import { StoryStopDef } from './types/story';
import { STORY_STOPS, getStoryStopByIndex, getNextStoryStop } from './story/storyData';
import { GameEngine } from './engine/GameEngine';
import { storageManager } from './engine/StorageManager';
import { GameModeId, ActiveGameModeId, GameModeSlug, GAME_MODES_LIST, SLUG_TO_MODE_ID } from './types/game';
import { CharacterId } from './types/characters';
import { soundEngine } from './engine/SoundEngine';
import { Haptics } from './engine/Haptics';
import { pwaManager } from './pwa/PwaManager';

const EXTRA_ALIASES: Record<string, ActiveGameModeId> = {
  muddycarwash: 'CAR_WASH',
  'muddy-car-wash': 'CAR_WASH',
  muddy_car_wash: 'CAR_WASH',
  muddypuddle: 'MUDDY_PUDDLES',
  muddypuddles: 'MUDDY_PUDDLES',
  'mud-puddles': 'MUDDY_PUDDLES',
  'muddy-puddles': 'MUDDY_PUDDLES',
  dinosaurballoon: 'DINOSAUR_BALLOON',
  'dinosaur-balloon': 'DINOSAUR_BALLOON',
  egglaying: 'EGG_LAYING',
  'egg-laying': 'EGG_LAYING'
};

/**
 * Resolves a URL hash (e.g. #egg_laying, #classic, #car-wash, #duck-picnic)
 * to a canonical ActiveGameModeId, or null if invalid or MENU.
 */
export function resolveHashToModeId(rawHash: string): ActiveGameModeId | null {
  if (!rawHash) return null;
  const cleaned = rawHash.replace(/^#+/, '').trim().toLowerCase();
  if (!cleaned || cleaned === 'menu') return null;

  // Extra aliases (e.g. legacy shortcuts or variations)
  if (cleaned in EXTRA_ALIASES) {
    return EXTRA_ALIASES[cleaned];
  }
  const alphaOnly = cleaned.replace(/[^a-z0-9]/g, '');
  if (alphaOnly in EXTRA_ALIASES) {
    return EXTRA_ALIASES[alphaOnly];
  }

  // Direct slug match (e.g. 'classic', 'car-wash', 'duck-picnic', 'mud-puddle')
  if (cleaned in SLUG_TO_MODE_ID) {
    return SLUG_TO_MODE_ID[cleaned as GameModeSlug];
  }

  // Slug with underscores turned to dashes (e.g. 'car_wash' -> 'car-wash')
  const slugDashed = cleaned.replace(/_/g, '-') as GameModeSlug;
  if (slugDashed in SLUG_TO_MODE_ID) {
    return SLUG_TO_MODE_ID[slugDashed];
  }

  // Direct uppercase match (e.g. 'EGG_LAYING', 'CAR_WASH')
  const upper = cleaned.toUpperCase() as ActiveGameModeId;
  if (GAME_MODES_LIST.includes(upper)) {
    return upper;
  }

  // Dashes turned to underscores (e.g. 'egg-laying' -> 'EGG_LAYING')
  const upperUnderscored = cleaned.replace(/-/g, '_').toUpperCase() as ActiveGameModeId;
  if (GAME_MODES_LIST.includes(upperUnderscored)) {
    return upperUnderscored;
  }

  // Stripped alphanumeric match (e.g. 'egglaying', 'muddypuddles')
  const alphanumericCleaned = cleaned.replace(/[^a-z0-9]/g, '');
  for (const mode of GAME_MODES_LIST) {
    if (mode.replace(/_/g, '').toLowerCase() === alphanumericCleaned) {
      return mode;
    }
  }

  return null;
}

export const App: React.FC = () => {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [currentMode, setCurrentMode] = useState<GameModeId>(() => {
    if (typeof window === 'undefined') return 'MENU';
    return resolveHashToModeId(window.location.hash) || 'MENU';
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [, setAvatarVersion] = useState<number>(0);
  const [canInstall, setCanInstall] = useState<boolean>(pwaManager.canShowInstallUI());

  // Story Journey Modals State
  const [isStoryIntroOpen, setIsStoryIntroOpen] = useState<boolean>(false);
  const [storyIntroDef, setStoryIntroDef] = useState<StoryStopDef | null>(null);
  const [isStoryVictoryOpen, setIsStoryVictoryOpen] = useState<boolean>(false);
  const [storyVictoryDef, setStoryVictoryDef] = useState<StoryStopDef | null>(null);
  const [storyVictoryScore, setStoryVictoryScore] = useState<number>(0);
  const [storyVictoryStars, setStoryVictoryStars] = useState<number>(3);
  const [storyVictoryIsNewStamp, setStoryVictoryIsNewStamp] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);

  // Initialize browser history state reflecting deep link or MENU
  useEffect(() => {
    if (typeof window === 'undefined' || !window.history) return;
    try {
      const mode = resolveHashToModeId(window.location.hash);
      if (mode) {
        window.history.replaceState(
          { mode },
          '',
          `${window.location.pathname}${window.location.search}#${mode.toLowerCase()}`
        );
      } else {
        window.history.replaceState(
          { mode: 'MENU' },
          '',
          `${window.location.pathname}${window.location.search}`
        );
      }
    } catch (_) {}
  }, []);

  // Listen for PWA installability updates
  useEffect(() => {
    setCanInstall(pwaManager.canShowInstallUI());
    const unsub1 = pwaManager.on('installableChange', () => {
      setCanInstall(pwaManager.canShowInstallUI());
    });
    const unsub2 = pwaManager.on('installed', () => {
      setCanInstall(false);
      setIsInstallModalOpen(false);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // Screen Wake Lock: Keep screen awake while playing mini-games
  useEffect(() => {
    if (currentMode !== 'MENU') {
      pwaManager.requestWakeLock().catch(() => {});
    } else {
      pwaManager.releaseWakeLock().catch(() => {});
    }
    return () => {
      pwaManager.releaseWakeLock().catch(() => {});
    };
  }, [currentMode]);

  // Handle Game Engine Ready and trigger deep-linked mode if hash was present
  const handleEngineReady = useCallback((inst: GameEngine) => {
    setEngine(inst);
    setIsMuted(inst.storage.isMuted());

    // Connect story journey hooks
    inst.onStoryIntroCallback = (stopIndex: number) => {
      const def = getStoryStopByIndex(stopIndex);
      if (def) {
        setStoryIntroDef(def);
        setIsStoryIntroOpen(true);
      }
    };

    inst.onStoryVictoryCallback = (stopIndex: number, score: number, stars: number, isNewStamp: boolean) => {
      const def = getStoryStopByIndex(stopIndex);
      if (def) {
        setStoryVictoryDef(def);
        setStoryVictoryScore(score);
        setStoryVictoryStars(stars);
        setStoryVictoryIsNewStamp(isNewStamp);
        setIsStoryVictoryOpen(true);
      }
    };

    const deepLinkedMode = resolveHashToModeId(window.location.hash);
    if (deepLinkedMode) {
      inst.changeScene(deepLinkedMode);
      setCurrentMode(deepLinkedMode);
    }
  }, []);

  // Keep browser history clean on scene changes
  const handleSceneChange = useCallback((mode: GameModeId) => {
    setCurrentMode(mode);
    if (typeof window !== 'undefined' && window.history) {
      try {
        if (mode !== 'MENU') {
          const hash = `#${mode.toLowerCase()}`;
          if (window.location.hash !== hash) {
            window.history.pushState({ mode }, '', hash);
          }
        } else if (window.location.hash) {
          window.history.replaceState(
            { mode: 'MENU' },
            '',
            `${window.location.pathname}${window.location.search}`
          );
        }
      } catch (_) {}
    }
  }, []);

  // Intercept mobile back gesture / Android hardware back button / browser forward & back
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      if (!engine) return;
      const targetMode = resolveHashToModeId(window.location.hash) || 'MENU';
      if (engine.currentSceneId !== targetMode) {
        if (targetMode === 'MENU') {
          soundEngine.playSFX('click');
          Haptics.tap();
        }
        engine.changeScene(targetMode);
        setCurrentMode(targetMode);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [engine]);

  const handleToggleMute = useCallback(() => {
    if (!engine) return;
    const newMute = !engine.storage.isMuted();
    engine.storage.setMuted(newMute);
    soundEngine.setMuted(newMute);
    soundEngine.playSFX('click');
    Haptics.tap();
    setIsMuted(newMute);
  }, [engine]);

  const handleToggleFullscreen = useCallback(() => {
    if (!engine) return;
    engine.toggleFullscreen();
    soundEngine.playSFX('click');
    Haptics.tap();
  }, [engine]);

  const handleGoHome = useCallback(() => {
    if (!engine) return;
    soundEngine.playSFX('click');
    Haptics.tap();
    engine.changeScene('MENU');
    setCurrentMode('MENU');
    if (typeof window !== 'undefined' && window.history && window.location.hash) {
      try {
        window.history.replaceState(
          { mode: 'MENU' },
          '',
          `${window.location.pathname}${window.location.search}`
        );
      } catch (_) {}
    }
  }, [engine]);

  const handleOpenInstall = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    setIsInstallModalOpen(true);
  }, []);

  const handleCloseInstall = useCallback(() => {
    setIsInstallModalOpen(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleOpenAvatarModal = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    setIsAvatarModalOpen(true);
  }, []);

  const handleCloseAvatarModal = useCallback(() => {
    setIsAvatarModalOpen(false);
  }, []);

  const handleAvatarChange = useCallback((_newAvatar: CharacterId) => {
    setAvatarVersion(v => v + 1);
  }, []);

  // Story Journey Handlers
  const handleStartStoryGame = useCallback(() => {
    setIsStoryIntroOpen(false);
  }, []);

  const handleCloseStoryIntro = useCallback(() => {
    setIsStoryIntroOpen(false);
    if (engine) {
      engine.changeScene('MENU');
      setCurrentMode('MENU');
    }
  }, [engine]);

  const handleNextStoryStop = useCallback(() => {
    setIsStoryVictoryOpen(false);
    if (engine && storyVictoryDef) {
      const nextStop = getNextStoryStop(storyVictoryDef.index);
      if (nextStop) {
        engine.launchStoryStop(nextStop.index, true);
        setCurrentMode(nextStop.modeId);
      } else {
        engine.changeScene('MENU');
        setCurrentMode('MENU');
      }
    }
  }, [engine, storyVictoryDef]);

  const handleReplayStoryStop = useCallback(() => {
    setIsStoryVictoryOpen(false);
    if (engine && storyVictoryDef) {
      engine.launchStoryStop(storyVictoryDef.index, false);
      setCurrentMode(storyVictoryDef.modeId);
    }
  }, [engine, storyVictoryDef]);

  const handleBackToMap = useCallback(() => {
    setIsStoryVictoryOpen(false);
    if (engine) {
      engine.changeScene('MENU');
      setCurrentMode('MENU');
    }
  }, [engine]);

  const handleOpenPassport = useCallback(() => {
    soundEngine.playSFX('click');
    Haptics.tap();
    setIsPassportOpen(true);
  }, []);

  const handleClosePassport = useCallback(() => {
    setIsPassportOpen(false);
  }, []);

  const handleSelectPassportStop = useCallback((stopIndex: number) => {
    if (engine) {
      engine.launchStoryStop(stopIndex, true);
    }
  }, [engine]);

  return (
    <main id="game-container">
      <GameCanvas onEngineReady={handleEngineReady} onSceneChange={handleSceneChange} />
      <HUD
        engine={engine}
        currentMode={currentMode}
        isMuted={isMuted}
        canInstall={canInstall}
        onOpenInstall={handleOpenInstall}
        onOpenSettings={handleOpenSettings}
        onOpenAvatarSelect={handleOpenAvatarModal}
        onOpenPassport={handleOpenPassport}
        onToggleMute={handleToggleMute}
        onToggleFullscreen={handleToggleFullscreen}
        onGoHome={handleGoHome}
      />
      <ToddlerTapFeedback />
      <PwaInstallModal isOpen={isInstallModalOpen} onClose={handleCloseInstall} />
      <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} storage={engine?.storage} />
      <AvatarSelectModal
        isOpen={isAvatarModalOpen}
        onClose={handleCloseAvatarModal}
        engine={engine}
        onAvatarChange={handleAvatarChange}
      />
      <StoryIntroModal
        isOpen={isStoryIntroOpen}
        stopDef={storyIntroDef}
        onStart={handleStartStoryGame}
        onClose={handleCloseStoryIntro}
      />
      <StoryVictoryModal
        isOpen={isStoryVictoryOpen}
        stopDef={storyVictoryDef}
        score={storyVictoryScore}
        stars={storyVictoryStars}
        isNewStamp={storyVictoryIsNewStamp}
        hasNext={storyVictoryDef ? storyVictoryDef.index < STORY_STOPS.length - 1 : false}
        onNextStop={handleNextStoryStop}
        onReplay={handleReplayStoryStop}
        onBackToMap={handleBackToMap}
      />
      <PassportModal
        isOpen={isPassportOpen}
        storage={engine ? engine.storage : storageManager}
        onClose={handleClosePassport}
        onSelectStop={handleSelectPassportStop}
      />
      <PwaUpdateToast />
      <PwaOfflinePill />
    </main>
  );
};
