/**
 * Particle Engine Type Definitions
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion
 */

export type ParticleType =
  | 'feather'
  | 'sparkle'
  | 'eggShell'
  | 'bubble'
  | 'confetti'
  | 'soapBubble'
  | 'pancakeSyrup'
  | 'mudClod'
  | 'steam'
  | 'text'
  | 'star'
  | 'circle'
  | 'square';

export type ParticleShape =
  | 'CIRCLE'
  | 'SQUARE'
  | 'STAR'
  | 'FEATHER'
  | 'TEXT'
  | 'BUBBLE'
  | 'CONFETTI'
  | 'SOAP_BUBBLE'
  | 'PANCAKE_SYRUP'
  | 'MUD_CLOD'
  | 'EGG_SHELL';

export interface IParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax?: number;
  ay?: number;
  drag?: number;
  color: string;
  size: number;
  initialSize?: number;
  alpha: number;
  maxLife: number;
  life: number;
  shape: ParticleShape | string;
  type?: ParticleType;
  text?: string;
  rotation?: number;
  vRot?: number;
  scaleX?: number;
  phase?: number;
  active: boolean;
  customData?: Record<string, unknown>;
}

// Backward-compatible alias for existing code
export type Particle = IParticle;

export interface IParticleSpawnOptions {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  ax?: number;
  ay?: number;
  drag?: number;
  color?: string;
  size?: number;
  maxLife?: number;
  type?: ParticleType;
  shape?: ParticleShape | string;
  rotation?: number;
  vRot?: number;
  scaleX?: number;
  phase?: number;
  text?: string;
}

export interface IParticleSystem {
  pool: IParticle[];
  readonly active: IParticle[];
  clear(): void;
  spawn(options: Partial<IParticle> | IParticleSpawnOptions): IParticle | null;
  spawnFeathers(x: number, y: number, count?: number): void;
  spawnSparkles(x: number, y: number, count?: number): void;
  spawnEggCrack(x: number, y: number, count?: number): void;
  spawnBubbles?(x: number, y: number, count?: number): void;
  spawnConfetti(x: number, y: number, count?: number): void;
  spawnSoapBubbles(x: number, y: number, count?: number): void;
  spawnPancakeSyrup(x: number, y: number, count?: number): void;
  spawnMudSplash(x: number, y: number, count?: number, isGolden?: boolean): void;
  spawnMudClods(x: number, y: number, count?: number, isGolden?: boolean): void;
  spawnSteam?(x: number, y: number): void;
  spawnScorePopup(x: number, y: number, text: string): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}
