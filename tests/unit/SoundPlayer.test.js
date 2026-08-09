import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SoundPlayer } from '../../src/audio/SoundPlayer.js';
import beepUrl from '../../src/audio/sounds/beep.mp3';
import wolfUrl from '../../src/audio/sounds/wolf.mp3';

describe('SoundPlayer', () => {
  let audioInstances;

  beforeEach(() => {
    audioInstances = [];
    vi.stubGlobal('Audio', class {
      constructor(src) {
        this.src = src;
        this.currentTime = 0;
        this.play = vi.fn(() => Promise.resolve());
        audioInstances.push(this);
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preloads the known sounds on construction', () => {
    new SoundPlayer();

    const srcs = audioInstances.map((a) => a.src);
    expect(srcs).toContain(beepUrl);
    expect(srcs).toContain(wolfUrl);
  });

  it('play() rewinds and plays the requested sound', () => {
    const player = new SoundPlayer();
    const beep = audioInstances.find((a) => a.src === beepUrl);
    beep.currentTime = 5;

    player.play('beep');

    expect(beep.currentTime).toBe(0);
    expect(beep.play).toHaveBeenCalled();
  });

  it('play() on an unknown sound name is a no-op', () => {
    const player = new SoundPlayer();

    expect(() => player.play('does-not-exist')).not.toThrow();
  });

  it('swallows a rejected play() promise instead of throwing', async () => {
    vi.stubGlobal('Audio', class {
      constructor(src) {
        this.src = src;
        this.currentTime = 0;
      }
      play() {
        return Promise.reject(new Error('autoplay blocked'));
      }
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const player = new SoundPlayer();

    player.play('beep');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
