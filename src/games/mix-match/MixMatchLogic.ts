/**
 * Mode 9: Trishu's Mix & Match Funny Studio - Pure Game Logic
 * Adventures of Trishu Mini-Game Suite
 */

import { FUNNY_ADJECTIVES } from './types';
import { CHARACTER_PARTS, drawCompositeCharacter } from '../../graphics/characters/modularBodyParts';
import { CharacterAnimState } from '../../types/characters';

export class MixMatchLogic {
  public time: number = 0;
  public headIdx: number = 0;
  public torsoIdx: number = 0;
  public legsIdx: number = 0;

  public isShuffling: boolean = false;
  public shuffleTimer: number = 0;
  public shuffleTickTimer: number = 0;

  public isDancing: boolean = false;
  public danceTimer: number = 0;

  public photoFlashTimer: number = 0;
  public photosSnapped: number = 0;
  public currentTitle: string = 'Trishu The Explorer';
  public score: number = 0;

  public reset(): void {
    this.time = 0;
    this.headIdx = 0;
    this.torsoIdx = 0;
    this.legsIdx = 0;
    this.isShuffling = false;
    this.shuffleTimer = 0;
    this.shuffleTickTimer = 0;
    this.isDancing = false;
    this.danceTimer = 0;
    this.photoFlashTimer = 0;
    this.photosSnapped = 0;
    this.score = 0;
    this.updateTitle();
  }

  public shuffle(): void {
    this.isShuffling = true;
    this.shuffleTimer = 1.2;
    this.shuffleTickTimer = 0;
  }

  public nextHead(dir: number = 1): void {
    this.headIdx = (this.headIdx + dir + 7) % 7;
    this.score += 10;
    this.updateTitle();
  }

  public nextTorso(dir: number = 1): void {
    this.torsoIdx = (this.torsoIdx + dir + 7) % 7;
    this.score += 10;
    this.updateTitle();
  }

  public nextLegs(dir: number = 1): void {
    this.legsIdx = (this.legsIdx + dir + 7) % 7;
    this.score += 10;
    this.updateTitle();
  }

  public triggerDance(): void {
    this.isDancing = true;
    this.danceTimer = 2.2;
    this.score += 50;
  }

  public snapPhoto(animState: CharacterAnimState): { saved: boolean } {
    this.photoFlashTimer = 0.35;
    this.photosSnapped++;
    this.score += 100;
    const saved = this.saveSnapshotToAlbum(animState);
    return { saved };
  }

  public saveSnapshotToAlbum(animState: CharacterAnimState): boolean {
    if (typeof document === 'undefined') return false;
    try {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 360;
      snapCanvas.height = 360;
      const sctx = snapCanvas.getContext('2d');
      if (!sctx) return false;

      sctx.fillStyle = '#FFF8E1';
      sctx.fillRect(0, 0, 360, 360);
      sctx.strokeStyle = '#FFD54F';
      sctx.lineWidth = 10;
      sctx.strokeRect(5, 5, 350, 350);

      sctx.fillStyle = '#FF7043';
      sctx.font = 'bold 18px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.fillText(this.currentTitle, 180, 42, 320);

      drawCompositeCharacter(sctx, this.headIdx, this.torsoIdx, this.legsIdx, 180, 195, 1.35, animState);

      sctx.fillStyle = '#8D6E63';
      sctx.font = 'bold 12px "Fredoka", "Quicksand", "Arial Rounded MT Bold", sans-serif';
      sctx.fillText('Adventures of Trishu', 180, 335);

      const dataUrl = typeof snapCanvas.toDataURL === 'function'
        ? snapCanvas.toDataURL('image/png')
        : 'data:image/png;base64,mock_photo';
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('hmc_saved_photos') : null;
      const photos: string[] = raw ? JSON.parse(raw) : [];
      photos.unshift(dataUrl);
      if (photos.length > 6) photos.length = 6;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hmc_saved_photos', JSON.stringify(photos));
      }
      return true;
    } catch (e) {
      console.warn('Failed to save snapshot:', e);
      return false;
    }
  }

  public updateTitle(): void {
    const hChar = CHARACTER_PARTS.heads[this.headIdx].character;
    const tChar = CHARACTER_PARTS.torsos[this.torsoIdx].character;
    const lChar = CHARACTER_PARTS.legs[this.legsIdx].character;

    if (this.headIdx === this.torsoIdx && this.torsoIdx === this.legsIdx) {
      this.currentTitle = `Classic ${hChar}!`;
    } else {
      const adj = FUNNY_ADJECTIVES[(this.headIdx + this.torsoIdx + this.legsIdx) % FUNNY_ADJECTIVES.length];
      this.currentTitle = `${adj} ${hChar}-${tChar} ${lChar}!`;
    }
  }

  public update(dt: number, animState: CharacterAnimState): { ticked: boolean; finishedShuffle: boolean } {
    this.time += dt;
    let ticked = false;
    let finishedShuffle = false;

    if (this.photoFlashTimer > 0) {
      this.photoFlashTimer = Math.max(0, this.photoFlashTimer - dt);
    }

    if (this.isDancing) {
      this.danceTimer -= dt;
      animState.headBob = Math.sin(this.time * 24) * 6;
      animState.wobbleAngle = Math.sin(this.time * 18) * 0.15;
      if (this.danceTimer <= 0) {
        this.isDancing = false;
        animState.headBob = 0;
        animState.wobbleAngle = 0;
      }
    }

    if (this.isShuffling) {
      this.shuffleTimer -= dt;
      this.shuffleTickTimer += dt;
      if (this.shuffleTickTimer >= 0.08) {
        this.shuffleTickTimer = 0;
        this.headIdx = Math.floor(Math.random() * 7);
        this.torsoIdx = Math.floor(Math.random() * 7);
        this.legsIdx = Math.floor(Math.random() * 7);
        ticked = true;
      }

      if (this.shuffleTimer <= 0) {
        this.isShuffling = false;
        this.updateTitle();
        this.triggerDance();
        finishedShuffle = true;
      }
    }

    return { ticked, finishedShuffle };
  }
}
