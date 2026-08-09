import { STAR_COUNT, CLOUD_COUNT, MIN_CLOUDS, CLOUD_RESPAWN_CHECK_MS, CONSTELLATIONS, CLOUD_PATTERNS } from './pixelSky.config.js';

export class PixelSky {
  constructor(container) {
    this.container = container;
  }

  mount() {
    this.#createStars();
    this.#createPixelClouds();
    setInterval(() => {
      if (this.container.querySelectorAll('.cloud').length < MIN_CLOUDS) {
        this.#createPixelClouds();
      }
    }, CLOUD_RESPAWN_CHECK_MS);
    document.addEventListener('mousemove', (e) => this.#onMouseMove(e));
  }

  #createStars() {
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const rand = Math.random();
      if (rand > 0.85) {
        star.classList.add('cross');
        if (Math.random() > 0.7) star.classList.add('big');
      } else if (rand > 0.75) {
        star.classList.add('bright');
      } else if (rand > 0.65) {
        star.classList.add('big');
      } else if (rand > 0.35) {
        star.classList.add('distant');
      }
      if (Math.random() > 0.95) {
        star.classList.add('colorful');
      }
      const yPosition = Math.pow(Math.random(), 2) * 70;
      star.style.left = Math.random() * 100 + '%';
      star.style.top = yPosition + '%';
      star.style.animationDelay = Math.random() * 6 + 's';
      if (Math.random() > 0.8) {
        star.style.animationDuration = (2 + Math.random() * 4) + 's';
      }
      this.container.appendChild(star);
    }
    this.#createConstellations();
  }

  #createConstellations() {
    CONSTELLATIONS.forEach((constellation) => {
      constellation.forEach((point) => {
        const star = document.createElement('div');
        star.className = 'star bright';
        star.style.left = point.x + '%';
        star.style.top = point.y + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        this.container.appendChild(star);
      });
    });
  }

  #createPixelClouds() {
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      if (Math.random() > 0.5) cloud.classList.add('dark');
      if (Math.random() > 0.7) cloud.classList.add('light');
      const pattern = CLOUD_PATTERNS[Math.floor(Math.random() * CLOUD_PATTERNS.length)];
      pattern.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] === '█') {
            const pixel = document.createElement('div');
            pixel.className = 'cloud-pixel';
            pixel.style.left = (x * 4) + 'px';
            pixel.style.top = (y * 4) + 'px';
            cloud.appendChild(pixel);
          }
        }
      });
      cloud.style.top = Math.random() * 50 + '%';
      cloud.style.left = -200 + 'px';
      cloud.style.animationDelay = Math.random() * 25 + 's';
      cloud.style.animationDuration = (20 + Math.random() * 15) + 's';
      this.container.appendChild(cloud);
    }
  }

  #onMouseMove(e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    this.container.querySelectorAll('.star').forEach((star, index) => {
      const speed = 0.5 + (index % 3) * 0.2;
      star.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
    this.container.querySelectorAll('.cloud').forEach((cloud, index) => {
      const speed = 0.3 + (index % 2) * 0.1;
      cloud.style.transform += ` translate(${mouseX * speed}px, ${mouseY * speed * 0.5}px)`;
    });
  }
}
