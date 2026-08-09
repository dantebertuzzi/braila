const SOUND_FILES = {
  beep: '/audio/beep.mp3',
  wolf: '/audio/wolf.mp3',
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
