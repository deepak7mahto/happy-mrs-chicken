/**
 * AudioSpy - Global telemetry recorder and test introspection harness
 * Adventures of Trishu 8-Game Suite
 */

import { AudioSpyEvent, AudioSpy as IAudioSpy } from '../../types/audio';
import { AudioContextHolder } from './AudioContextHolder';

export class AudioSpyImpl implements IAudioSpy {
  public events: AudioSpyEvent[] = [];
  private holder: AudioContextHolder;
  private readonly maxEvents: number = 500;

  constructor(holder: AudioContextHolder) {
    this.holder = holder;
  }

  public clear(): void {
    this.events = [];
  }

  public record(type: string, params: unknown = {}): void {
    this.events.push({
      type,
      timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      params
    });
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  public isContextRunning(): boolean {
    return Boolean(this.holder.ctx && this.holder.ctx.state === 'running');
  }

  public getEventsByType(type: string): AudioSpyEvent[] {
    return this.events.filter(e => e.type === type);
  }
}
