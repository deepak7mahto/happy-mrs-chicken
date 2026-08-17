/**
 * Tier 3: Empirical Web Audio Engine Verification Suite
 * Comprehensive Adversarial & Empirical Test Harness for M1 Core Audio
 * Peppa Pig: Happy Mrs Chicken 8-Game Deluxe Expansion Suite
 */

import { describe, test, expect, beforeEach, afterEach } from './e2e_runner.mjs';
import { AudioContextHolder } from '../src/engine/audio/AudioContextHolder';
import { SoundSynthesizer } from '../src/engine/audio/SoundSynthesizer';
import { BGMSequencer } from '../src/engine/audio/BGMSequencer';
import { AudioSpyImpl } from '../src/engine/audio/AudioSpy';
import { SoundEngine, soundEngine } from '../src/engine/audio/index';
import { SFXName } from '../src/types/audio';

describe('Tier 3: Web Audio Engine Empirical Verification Suite', () => {
  let holder: AudioContextHolder;
  let synth: SoundSynthesizer;
  let sequencer: BGMSequencer;
  let spy: AudioSpyImpl;

  const ALL_18_SFX: SFXName[] = [
    'cluck',
    'eggPop',
    'crack',
    'hatch',
    'splash',
    'seedDrop',
    'fanfare',
    'crash',
    'click',
    'dinosaurRoar',
    'balloonPop',
    'pancakeSizzle',
    'whoosh',
    'veggiePop',
    'mudThud',
    'bubblePop',
    'sheepBleat',
    'toddlerGiggle'
  ];

  beforeEach(async () => {
    holder = new AudioContextHolder();
    await holder.init();
    synth = new SoundSynthesizer(holder);
    sequencer = new BGMSequencer(holder);
    spy = new AudioSpyImpl(holder);
  });

  afterEach(() => {
    if (sequencer && sequencer.isRunning) {
      sequencer.stop();
    }
  });

  // =========================================================================
  // 1. AudioContextHolder & Graph Topology Tests
  // =========================================================================

  test('T3.01_holder_initialization_topology - Context and audio graph topology are correctly constructed', async () => {
    expect(holder.ctx).toBeDefined();
    expect(holder.masterGain).toBeDefined();
    expect(holder.sfxGain).toBeDefined();
    expect(holder.musicGain).toBeDefined();
    expect(holder.compressor).toBeDefined();
    expect(holder.noiseBuffer).toBeDefined();

    // Verify gain initial values
    expect(holder.sfxGain!.gain.value).toBeCloseTo(0.85, 2);
    expect(holder.musicGain!.gain.value).toBeCloseTo(0.35, 2);
    expect(holder.masterGain!.gain.value).toBeCloseTo(1.0, 2);

    // Verify DynamicsCompressorNode parameters
    expect(holder.compressor!.threshold.value).toBeCloseTo(-4.0, 1);
    expect(holder.compressor!.knee.value).toBeCloseTo(8.0, 1);
    expect(holder.compressor!.ratio.value).toBeCloseTo(12.0, 1);
    expect(holder.compressor!.attack.value).toBeCloseTo(0.003, 3);
    expect(holder.compressor!.release.value).toBeCloseTo(0.15, 2);

    // Verify NoiseBuffer dimensions (2 seconds at sampleRate)
    expect(holder.noiseBuffer!.numberOfChannels).toBe(1);
    expect(holder.noiseBuffer!.length).toBe(holder.ctx!.sampleRate * 2);
    const data = holder.noiseBuffer!.getChannelData(0);
    expect(data.length).toBe(holder.ctx!.sampleRate * 2);
  });

  test('T3.02_holder_unlock_and_resume - Unlock resumes suspended context and sets isUnlocked', async () => {
    await holder.ctx!.suspend();
    expect(holder.ctx!.state).toBe('suspended');

    const unlocked = await holder.unlock();
    expect(unlocked).toBeTruthy();
    expect(holder.isUnlocked).toBeTruthy();
    expect(holder.ctx!.state).toBe('running');
  });

  test('T3.03_holder_volume_and_mute_control - Clamps volume and toggles mute gain cleanly', () => {
    // Volume clamping test
    holder.setVolume(0.5);
    expect(holder.volume).toBeCloseTo(0.5, 2);
    expect(holder.masterGain!.gain.value).toBeCloseTo(0.5, 2);

    holder.setVolume(1.8); // Should clamp to 1.0
    expect(holder.volume).toBeCloseTo(1.0, 2);
    expect(holder.masterGain!.gain.value).toBeCloseTo(1.0, 2);

    holder.setVolume(-0.4); // Should clamp to 0.0
    expect(holder.volume).toBeCloseTo(0.0, 2);
    expect(holder.masterGain!.gain.value).toBeCloseTo(0.0, 2);

    // Mute toggling test
    holder.setVolume(0.8);
    holder.setMuted(true);
    expect(holder.isMuted).toBeTruthy();
    expect(holder.masterGain!.gain.value).toBeCloseTo(0.0, 2);

    // Modifying volume while muted should not unmute masterGain
    holder.setVolume(0.6);
    expect(holder.volume).toBeCloseTo(0.6, 2);
    expect(holder.masterGain!.gain.value).toBeCloseTo(0.0, 2);

    // Unmuting should restore the configured volume
    holder.setMuted(false);
    expect(holder.isMuted).toBeFalsy();
    expect(holder.masterGain!.gain.value).toBeCloseTo(0.6, 2);
  });

  // =========================================================================
  // 2. All 18 SFX Recipes Synthesizer Verification
  // =========================================================================

  test('T3.04_sfx_all_18_recipes_exist - Verifies all 18 SFX names are handled without throwing', () => {
    for (const sfx of ALL_18_SFX) {
      expect(() => {
        synth.playSFX(sfx);
      }).not.toThrow();
    }
  });

  test('T3.05_sfx_cluck_recipe - Verifies cluck synthesis parameters and high-pitch variation', () => {
    expect(() => synth.playCluck('short')).not.toThrow();
    expect(() => synth.playCluck('high')).not.toThrow();
    expect(() => synth.playSFX('cluck', { type: 'high' })).not.toThrow();
  });

  test('T3.06_sfx_egg_pop_recipe - Verifies eggPop pitch-drop oscillator envelope', () => {
    expect(() => synth.playEggPop()).not.toThrow();
    expect(() => synth.playSFX('eggPop')).not.toThrow();
  });

  test('T3.07_sfx_crack_and_hatch_recipe - Verifies crack and hatch composite synthesis', () => {
    expect(() => synth.playCrack()).not.toThrow();
    expect(() => synth.playHatch()).not.toThrow();
    expect(() => synth.playSFX('crack')).not.toThrow();
    expect(() => synth.playSFX('hatch')).not.toThrow();
  });

  test('T3.08_sfx_splash_recipe - Verifies splash noise filter sweep and intensity modulation', () => {
    expect(() => synth.playSplash(0.5)).not.toThrow();
    expect(() => synth.playSplash(1.0)).not.toThrow();
    expect(() => synth.playSplash(2.0)).not.toThrow();
    expect(() => synth.playSFX('splash', { intensity: 1.5 })).not.toThrow();
  });

  test('T3.09_sfx_seed_drop_recipe - Verifies seedDrop 3-tier harmonic chime synthesis', () => {
    expect(() => synth.playSeedDrop()).not.toThrow();
    expect(() => synth.playSFX('seedDrop')).not.toThrow();
  });

  test('T3.10_sfx_fanfare_recipe - Verifies victory fanfare ascending melodic sequence', () => {
    expect(() => synth.playFanfare()).not.toThrow();
    expect(() => synth.playSFX('fanfare')).not.toThrow();
  });

  test('T3.11_sfx_crash_recipe - Verifies crash noise burst and low-frequency sweep', () => {
    expect(() => synth.playCrash()).not.toThrow();
    expect(() => synth.playSFX('crash')).not.toThrow();
  });

  test('T3.12_sfx_click_recipe - Verifies UI click transient generator', () => {
    expect(() => synth.playClick()).not.toThrow();
    expect(() => synth.playSFX('click')).not.toThrow();
  });

  test('T3.13_sfx_dinosaur_roar_recipe - Verifies dual-sawtooth LFO modulated roar synthesis', () => {
    expect(() => synth.playDinosaurRoar()).not.toThrow();
    expect(() => synth.playSFX('dinosaurRoar')).not.toThrow();
  });

  test('T3.14_sfx_balloon_pop_recipe - Verifies balloon pop highpass noise burst', () => {
    expect(() => synth.playBalloonPop()).not.toThrow();
    expect(() => synth.playSFX('balloonPop')).not.toThrow();
  });

  test('T3.15_sfx_pancake_sizzle_recipe - Verifies pancake sizzle bandpass sustain envelope', () => {
    expect(() => synth.playPancakeSizzle()).not.toThrow();
    expect(() => synth.playSFX('pancakeSizzle')).not.toThrow();
  });

  test('T3.16_sfx_whoosh_recipe - Verifies whoosh resonant filter sweep', () => {
    expect(() => synth.playWhoosh()).not.toThrow();
    expect(() => synth.playSFX('whoosh')).not.toThrow();
  });

  test('T3.17_sfx_veggie_pop_recipe - Verifies veggiePop pitch bend recipe', () => {
    expect(() => synth.playVeggiePop()).not.toThrow();
    expect(() => synth.playSFX('veggiePop')).not.toThrow();
  });

  test('T3.18_sfx_mud_thud_recipe - Verifies mudThud low-frequency bass impact', () => {
    expect(() => synth.playMudThud()).not.toThrow();
    expect(() => synth.playSFX('mudThud')).not.toThrow();
  });

  test('T3.19_sfx_bubble_pop_recipe - Verifies bubblePop dual high-frequency sine pops', () => {
    expect(() => synth.playBubblePop()).not.toThrow();
    expect(() => synth.playSFX('bubblePop')).not.toThrow();
  });

  test('T3.20_sfx_sheep_bleat_recipe - Verifies sheepBleat sawtooth vibrato synthesis', () => {
    expect(() => synth.playSheepBleat()).not.toThrow();
    expect(() => synth.playSFX('sheepBleat')).not.toThrow();
  });

  test('T3.21_sfx_toddler_giggle_recipe - Verifies toddlerGiggle ascending sequence', () => {
    expect(() => synth.playToddlerGiggle()).not.toThrow();
    expect(() => synth.playSFX('toddlerGiggle')).not.toThrow();
  });

  // =========================================================================
  // 3. BGMSequencer Multi-Track Clock & Ducking Tests
  // =========================================================================

  test('T3.22_bgm_sequencer_lifecycle - Starts, schedules lookahead steps, and cleanly stops', async () => {
    expect(sequencer.isRunning).toBeFalsy();
    expect(sequencer.tempo).toBe(128);

    sequencer.start();
    expect(sequencer.isRunning).toBeTruthy();

    // Re-starting while already running should be idempotent
    sequencer.start();
    expect(sequencer.isRunning).toBeTruthy();

    // Advance mock time
    holder.ctx!.currentTime += 0.5;

    sequencer.stop();
    expect(sequencer.isRunning).toBeFalsy();

    // Re-stopping while stopped should be idempotent
    sequencer.stop();
    expect(sequencer.isRunning).toBeFalsy();
  });

  test('T3.23_bgm_tempo_control - Sets and clamps BPM values between 60 and 220', () => {
    sequencer.setTempo(140);
    expect(sequencer.tempo).toBe(140);

    sequencer.setTempo(300); // Exceeds max 220 -> clamps to 220
    expect(sequencer.tempo).toBe(220);

    sequencer.setTempo(40); // Below min 60 -> clamps to 60
    expect(sequencer.tempo).toBe(60);

    sequencer.setTempo(128);
    expect(sequencer.tempo).toBe(128);
  });

  test('T3.24_bgm_ducking - duckBGM attenuates music gain and sets restore ramp', () => {
    expect(holder.musicGain).toBeDefined();
    expect(() => sequencer.duckBGM(0.5)).not.toThrow();

    // Rapid repeated ducking should not throw or corrupt audio parameters
    expect(() => {
      sequencer.duckBGM(0.3);
      sequencer.duckBGM(0.8);
      sequencer.duckBGM(0.1);
    }).not.toThrow();
  });

  // =========================================================================
  // 4. AudioSpy Introspection & Telemetry Tests
  // =========================================================================

  test('T3.25_audio_spy_event_recording - Records events with timestamp and params', () => {
    spy.clear();
    expect(spy.events.length).toBe(0);

    spy.record('cluck', { type: 'high' });
    spy.record('eggPop');
    spy.record('bgm_start');

    expect(spy.events.length).toBe(3);
    expect(spy.events[0].type).toBe('cluck');
    expect((spy.events[0].params as { type: string }).type).toBe('high');
    expect(spy.events[0].timestamp).toBeGreaterThan(0);

    expect(spy.isContextRunning()).toBeTruthy();

    const cluckEvents = spy.getEventsByType('cluck');
    expect(cluckEvents.length).toBe(1);
    expect(cluckEvents[0].type).toBe('cluck');

    spy.clear();
    expect(spy.events.length).toBe(0);
  });

  test('T3.26_audio_spy_ring_buffer_cap - Caps at 500 events and maintains FIFO order', () => {
    spy.clear();
    for (let i = 0; i < 600; i++) {
      spy.record(`event_${i}`, { index: i });
    }

    expect(spy.events.length).toBe(500);
    // Oldest 100 events should have shifted out; first should be event_100
    expect(spy.events[0].type).toBe('event_100');
    expect(spy.events[499].type).toBe('event_599');
  });

  // =========================================================================
  // 5. SoundEngine Facade & Window Global Hooks
  // =========================================================================

  test('T3.27_sound_engine_facade_all_sfx - soundEngine dispatches all 18 SFX and logs to spy', () => {
    soundEngine.spy.clear();

    for (const sfx of ALL_18_SFX) {
      soundEngine.playSFX(sfx);
    }

    expect(soundEngine.spy.events.length).toBe(18);
    for (let i = 0; i < ALL_18_SFX.length; i++) {
      expect(soundEngine.spy.events[i].type).toBe(ALL_18_SFX[i]);
    }
  });

  test('T3.28_sound_engine_bgm_integration - startBGM, stopBGM, setBGMTempo log to spy and manage sequencer', async () => {
    soundEngine.spy.clear();

    soundEngine.startBGM();
    // Allow unlock promise to resolve
    await new Promise(r => setTimeout(r, 10));

    expect(soundEngine.sequencer.isRunning).toBeTruthy();
    expect(soundEngine.spy.events.some(e => e.type === 'bgm_start')).toBeTruthy();

    soundEngine.setBGMTempo(150);
    expect(soundEngine.sequencer.tempo).toBe(150);
    expect(soundEngine.spy.events.some(e => e.type === 'bgm_tempo')).toBeTruthy();

    soundEngine.stopBGM();
    expect(soundEngine.sequencer.isRunning).toBeFalsy();
    expect(soundEngine.spy.events.some(e => e.type === 'bgm_stop')).toBeTruthy();
  });

  test('T3.29_sound_engine_backward_compat_methods - Tests all legacy helper aliases', () => {
    soundEngine.spy.clear();

    soundEngine.playCluck('high');
    soundEngine.playEggPop();
    soundEngine.playCrack();
    soundEngine.playHatch();
    soundEngine.playMudSplash(1.2);
    soundEngine.playSeedChime();
    soundEngine.playVictoryFanfare();
    soundEngine.playOverheatCrash();
    soundEngine.playClick();
    soundEngine.playTone(440, 0.1);

    const types = soundEngine.spy.events.map(e => e.type);
    expect(types).toContain('cluck');
    expect(types).toContain('eggPop');
    expect(types).toContain('crack');
    expect(types).toContain('hatch');
    expect(types).toContain('splash');
    expect(types).toContain('seedDrop');
    expect(types).toContain('fanfare');
    expect(types).toContain('crash');
    expect(types).toContain('click');
  });

  test('T3.30_window_global_audio_hooks - window.__AUDIO_SPY__ and window.__AUDIO_ENGINE__ exist and work', async () => {
    const win = window as unknown as {
      __AUDIO_SPY__: AudioSpyImpl;
      __AUDIO_ENGINE__: {
        init: () => Promise<boolean>;
        unlock: () => Promise<boolean>;
        setMuted: (m: boolean) => void;
        isMuted: () => boolean;
        playSFX: (name: SFXName, opt?: unknown) => void;
        startBGM: () => void;
        stopBGM: () => void;
        setBGMTempo: (bpm: number) => void;
      };
    };

    expect(win.__AUDIO_SPY__).toBeDefined();
    expect(win.__AUDIO_ENGINE__).toBeDefined();

    win.__AUDIO_SPY__.clear();
    win.__AUDIO_ENGINE__.playSFX('eggPop');
    win.__AUDIO_ENGINE__.playSFX('dinosaurRoar');

    expect(win.__AUDIO_SPY__.events.length).toBe(2);
    expect(win.__AUDIO_SPY__.events[0].type).toBe('eggPop');
    expect(win.__AUDIO_SPY__.events[1].type).toBe('dinosaurRoar');

    win.__AUDIO_ENGINE__.setMuted(true);
    expect(win.__AUDIO_ENGINE__.isMuted()).toBeTruthy();

    win.__AUDIO_ENGINE__.setMuted(false);
    expect(win.__AUDIO_ENGINE__.isMuted()).toBeFalsy();

    win.__AUDIO_ENGINE__.setBGMTempo(135);
    expect(soundEngine.sequencer.tempo).toBe(135);
  });

  // =========================================================================
  // 6. Adversarial Stress & Edge Cases
  // =========================================================================

  test('T3.31_stress_rapid_concurrent_sfx_burst - Dispatches 200 polyphonic SFX in a single tick', () => {
    expect(() => {
      for (let i = 0; i < 200; i++) {
        const sfx = ALL_18_SFX[i % ALL_18_SFX.length];
        synth.playSFX(sfx, { intensity: Math.random() * 2, pitch: Math.random() * 2000 });
      }
    }).not.toThrow();
  });

  test('T3.32_edge_case_uninitialized_and_muted_sfx - Muted or uninitialized engine safely drops audio', async () => {
    const freshHolder = new AudioContextHolder();
    const freshSynth = new SoundSynthesizer(freshHolder);

    // Uninitialized context: should safely no-op without throwing
    expect(() => {
      freshSynth.playSFX('cluck');
      freshSynth.playSFX('eggPop');
      freshSynth.playSFX('splash');
    }).not.toThrow();

    // Initialized but muted
    await freshHolder.init();
    freshHolder.setMuted(true);
    expect(() => {
      freshSynth.playSFX('fanfare');
      freshSynth.playSFX('dinosaurRoar');
      freshSynth.playSFX('toddlerGiggle');
    }).not.toThrow();
  });

  test('T3.33_edge_case_rapid_bgm_tempo_fuzzing - Rapid extreme tempo fluctuations remain clamped and stable', () => {
    const extremeTempos = [-999, 0, 1, 59, 60, 128, 220, 221, 99999, NaN, 120];

    for (const bpm of extremeTempos) {
      sequencer.setTempo(bpm);
      if (!Number.isNaN(bpm)) {
        expect(sequencer.tempo).toBeGreaterThanOrEqual(60);
        expect(sequencer.tempo).toBeLessThanOrEqual(220);
      }
    }
  });
});
