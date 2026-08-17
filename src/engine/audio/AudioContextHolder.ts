/**
 * AudioContextHolder - Web Audio Context lifecycle, unlock management, and graph topology
 * Adventures of Trishu 8-Game Suite
 */

export class AudioContextHolder {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public sfxGain: GainNode | null = null;
  public musicGain: GainNode | null = null;
  public compressor: DynamicsCompressorNode | null = null;
  public noiseBuffer: AudioBuffer | null = null;
  public isUnlocked = false;
  public isMuted = false;
  public volume = 1.0;

  constructor() {
    if (typeof window === 'undefined') return;
    const unlockHandler = () => {
      this.unlock();
      ['pointerdown', 'touchstart', 'keydown', 'mousedown'].forEach(e => window.removeEventListener(e, unlockHandler, { capture: true }));
    };
    ['pointerdown', 'touchstart', 'keydown', 'mousedown'].forEach(e => window.addEventListener(e, unlockHandler, { capture: true, passive: true }));
  }

  public async init(): Promise<boolean> {
    if (this.ctx) return true;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-4.0, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(8.0, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12.0, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.sfxGain.connect(this.compressor);
      this.musicGain.connect(this.compressor);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      const len = Math.floor(this.ctx.sampleRate * 2);
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const out = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) out[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) {
      console.warn('Web Audio init error:', e);
      return false;
    }
  }

  public async unlock(): Promise<boolean> {
    if (!this.ctx) await this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch (_) {}
    }
    try {
      const dummy = this.ctx.createBufferSource();
      dummy.buffer = this.ctx.createBuffer(1, 1, 22050);
      dummy.connect(this.ctx.destination);
      dummy.start(0);
      dummy.stop(0.001);
    } catch (_) {}
    this.isUnlocked = this.ctx.state === 'running';
    return this.isUnlocked;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx && !this.isMuted) this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
  }
}
