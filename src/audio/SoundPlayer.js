import beepUrl from './sounds/beep.mp3';
import wolfUrl from './sounds/wolf.mp3';

const SOUND_FILES = {
  beep: beepUrl,
  wolf: wolfUrl,
};

export class SoundPlayer {
  #cache = new Map();

  constructor() {
    for (const [name, src] of Object.entries(SOUND_FILES)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      this.#cache.set(name, audio);
    }
  }

  play(name) {
    const audio = this.#cache.get(name);
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.warn(`Falha ao reproduzir som "${name}":`, err.message);
    });
  }
}
