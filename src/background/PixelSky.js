import { STAR_COUNT, CLOUD_COUNT, CONSTELLATIONS, CLOUD_PATTERNS } from './pixelSky.config.js';

export class PixelSky {
  constructor(container) {
    this.container = container;
    this.pendingMouseEvent = null;
    this.mouseRafId = null;
  }

  mount() {
    this.#createStars();
    this.#createPixelClouds();
    document.addEventListener('mousemove', (e) => this.#queueMouseMove(e));
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

  #queueMouseMove(e) {
    this.pendingMouseEvent = e;
    if (this.mouseRafId) return;
    this.mouseRafId = requestAnimationFrame(() => {
      this.#onMouseMove(this.pendingMouseEvent);
      this.mouseRafId = null;
    });
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
      cloud.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed * 0.5}px)`;
    });
  }
}
