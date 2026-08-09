import { TimerController } from './timer/TimerController.js';
import { PixelSky } from './background/PixelSky.js';
import './styles/base.css';
import './styles/timer.css';
import './styles/pixel-sky.css';
import './styles/bat.css';

document.addEventListener('DOMContentLoaded', () => {
  new PixelSky(document.querySelector('.pixel-container')).mount();
  new TimerController(document);
});
