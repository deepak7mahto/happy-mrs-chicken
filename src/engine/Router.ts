/**
 * URL Hash Router & Deep Linking Manager
 * Adventures of Trishu Mini-Game Suite
 * Decoupled, Pure TypeScript - Zero React
 */

import { ActiveGameModeId, GameModeId, GameModeSlug, GAME_MODES_LIST, SLUG_TO_MODE_ID } from '../types/game';

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

export class Router {
  private onRouteChangeCallback?: (modeId: GameModeId) => void;

  constructor(onRouteChange?: (modeId: GameModeId) => void) {
    this.onRouteChangeCallback = onRouteChange;
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.handleHashChange());
    }
  }

  public getInitialMode(): GameModeId {
    if (typeof window === 'undefined') return 'MENU';
    return resolveHashToModeId(window.location.hash) || 'MENU';
  }

  public setRoute(modeId: GameModeId): void {
    if (typeof window === 'undefined') return;
    if (modeId === 'MENU') {
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } else {
      const targetHash = `#${modeId.toLowerCase().replace(/_/g, '-')}`;
      if (window.location.hash !== targetHash) {
        history.replaceState(null, '', targetHash);
      }
    }
  }

  private handleHashChange(): void {
    const mode = resolveHashToModeId(window.location.hash) || 'MENU';
    if (this.onRouteChangeCallback) {
      this.onRouteChangeCallback(mode);
    }
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', () => this.handleHashChange());
    }
  }
}
