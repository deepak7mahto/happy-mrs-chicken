/**
 * Mode 18: Farmyard Animal Band - Simulation Logic
 * Headless pentatonic audio simulation
 * Strictly under 500 lines
 */

import { BandMember, InstrumentType, MusicNoteItem } from './types';

export class AnimalBandLogic {
  public members: BandMember[] = [];
  public tuttiTimer: number = 0;
  public score: number = 0;
  public totalNotesPlayed: number = 0;
  public notes: MusicNoteItem[] = [];
  public width: number = 960;
  public height: number = 540;
  private nextNoteId: number = 1;

  public get isTuttiActive(): boolean {
    return this.tuttiTimer > 0;
  }

  public reset(w: number = 960, h: number = 540): void {
    this.width = w;
    this.height = h;
    this.score = 0;
    this.totalNotesPlayed = 0;
    this.tuttiTimer = 0;
    this.notes = [];
    this.nextNoteId = 1;

    // 5 Pentatonic members: C5, D5, E5, G5, A5
    const memberConfigs: {
      id: string;
      name: string;
      characterId: any;
      instrument: InstrumentType;
      instrumentName: string;
      notePitch: number;
      noteName: string;
      color: string;
    }[] = [
      {
        id: 'clucky',
        name: 'Clucky',
        characterId: 'chicken',
        instrument: 'xylophone',
        instrumentName: 'Xylophone',
        notePitch: 523.25, // C5
        noteName: 'C',
        color: '#FF5722'
      },
      {
        id: 'leo',
        name: 'Leo',
        characterId: 'leo',
        instrument: 'drums',
        instrumentName: 'Bass Drum',
        notePitch: 587.33, // D5
        noteName: 'D',
        color: '#4CAF50'
      },
      {
        id: 'mimi',
        name: 'Mimi',
        characterId: 'mimi',
        instrument: 'maracas',
        instrumentName: 'Maracas',
        notePitch: 659.25, // E5
        noteName: 'E',
        color: '#E91E63'
      },
      {
        id: 'duck',
        name: 'Ducky',
        characterId: 'duck',
        instrument: 'accordion',
        instrumentName: 'Accordion',
        notePitch: 783.99, // G5
        noteName: 'G',
        color: '#FFEB3B'
      },
      {
        id: 'dad',
        name: 'Daddy',
        characterId: 'dad',
        instrument: 'bass',
        instrumentName: 'Big Tuba',
        notePitch: 880.00, // A5
        noteName: 'A',
        color: '#2196F3'
      }
    ];

    this.members = memberConfigs.map(cfg => ({
      id: cfg.id,
      name: cfg.name,
      characterId: cfg.characterId,
      instrument: cfg.instrument,
      instrumentName: cfg.instrumentName,
      notePitch: cfg.notePitch,
      noteName: cfg.noteName,
      color: cfg.color,
      x: 0,
      y: 0,
      width: 120,
      height: 150,
      isBouncing: false,
      bounceTimer: 0,
      hopY: 0,
      playCount: 0
    }));

    this.layout(w, h);
  }

  public layout(w: number, h: number): void {
    this.width = w;
    this.height = h;

    const isPortrait = h > w;
    const stageY = isPortrait ? h * 0.48 : h * 0.55;
    const spacing = w / (this.members.length + 1);

    this.members.forEach((member, i) => {
      member.x = spacing * (i + 1);
      member.y = stageY;
    });
  }

  public playMember(index: number): { played: boolean; pitch: number; member: BandMember } {
    if (index < 0 || index >= this.members.length) {
      return { played: false, pitch: 0, member: this.members[0] };
    }

    const member = this.members[index];
    member.isBouncing = true;
    member.bounceTimer = 0.5;
    member.playCount++;
    this.totalNotesPlayed++;
    this.score += 10;

    // Spawn floating musical note glyph
    this.spawnNote(member.x, member.y - member.height * 0.5, member.color);

    return {
      played: true,
      pitch: member.notePitch,
      member
    };
  }

  public triggerTutti(): void {
    this.tuttiTimer = 2.0;
    this.score += 50;

    for (let i = 0; i < this.members.length; i++) {
      const member = this.members[i];
      member.isBouncing = true;
      member.bounceTimer = 2.0;
      this.spawnNote(member.x, member.y - member.height * 0.5, member.color);
    }
  }

  public spawnNote(x: number, y: number, color: string): void {
    const glyphs = ['🎵', '🎶', '✨', '⭐'];
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
    this.notes.push({
      id: this.nextNoteId++,
      x: x + (Math.random() - 0.5) * 30,
      y: y - 20,
      vx: (Math.random() - 0.5) * 40,
      vy: -100 - Math.random() * 60,
      glyph,
      alpha: 1.0,
      color,
      scale: 1.0 + Math.random() * 0.3
    });
  }

  public findMemberAt(x: number, y: number): number {
    return this.members.findIndex(m => {
      const halfW = m.width * 0.6;
      const halfH = m.height * 0.6;
      return Math.abs(x - m.x) <= halfW && Math.abs(y - m.y) <= halfH;
    });
  }

  public update(dt: number): void {
    // Tutti timer
    if (this.tuttiTimer > 0) {
      this.tuttiTimer -= dt;
      if (this.tuttiTimer <= 0) {
        this.tuttiTimer = 0;
      }
    }

    // Members bounce
    for (const member of this.members) {
      if (member.bounceTimer > 0) {
        member.bounceTimer -= dt;
        const progress = member.bounceTimer / 0.5;
        // Simple hop sine wave
        member.hopY = -28 * Math.abs(Math.sin(progress * Math.PI * 2));
        if (member.bounceTimer <= 0) {
          member.bounceTimer = 0;
          member.isBouncing = false;
          member.hopY = 0;
        }
      } else {
        member.hopY = 0;
      }
    }

    // Update floating notes
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];
      note.x += note.vx * dt;
      note.y += note.vy * dt;
      note.alpha -= dt * 0.9;
      if (note.alpha <= 0) {
        this.notes.splice(i, 1);
      }
    }
  }
}
