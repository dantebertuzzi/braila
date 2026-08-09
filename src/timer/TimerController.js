import { DEFAULT_STUDY_TIME_MIN, DEFAULT_BREAK_TIME_MIN } from './timerConstants.js';
import { SoundPlayer } from '../audio/SoundPlayer.js';

export class TimerController {
  constructor(root = document) {
    this.worker = new Worker(new URL('./timer.worker.js', import.meta.url), { type: 'module' });
    this.sounds = new SoundPlayer();

    this.studyTimeMin = DEFAULT_STUDY_TIME_MIN;
    this.breakTimeMin = DEFAULT_BREAK_TIME_MIN;
    this.minutes = this.studyTimeMin;
    this.seconds = 0;
    this.isRunning = false;
    this.isBreak = false;
    this.cyclesCompleted = 0;

    this.els = {
      start: root.getElementById('start'),
      stop: root.getElementById('stop'),
      reset: root.getElementById('reset'),
      display: root.querySelector('.time-display'),
      studyInput: root.getElementById('study-time'),
      breakInput: root.getElementById('break-time'),
      studyValue: root.getElementById('study-value'),
      breakValue: root.getElementById('break-value'),
      cycles: root.getElementById('cycles'),
    };

    this.#bindEvents();
    this.worker.onmessage = (e) => this.#handleWorkerMessage(e.data);
    this.#render();
  }

  #bindEvents() {
    this.els.start.addEventListener('click', () => this.toggle());
    this.els.stop.addEventListener('click', () => this.stop());
    this.els.reset.addEventListener('click', () => this.reset());
    this.els.studyInput.addEventListener('input', () => this.#updateSettings());
    this.els.breakInput.addEventListener('input', () => this.#updateSettings());
  }

  #handleWorkerMessage(data) {
    if (data.type === 'update') {
      this.minutes = data.minutes;
      this.seconds = data.seconds;
      this.#render();
    } else if (data.type === 'cycleComplete') {
      this.#onCycleComplete(data.isBreak);
    }
  }

  toggle() {
    this.isRunning ? this.pause() : this.start();
  }

  start() {
    this.worker.postMessage({ command: 'start', minutes: this.minutes, seconds: this.seconds });
    this.isRunning = true;
    this.els.start.innerHTML = '<i class="fas fa-pause"></i>';
    this.els.stop.disabled = false;
    document.body.classList.remove('paused-background');
  }

  pause() {
    this.worker.postMessage({ command: 'pause' });
    this.isRunning = false;
    this.els.start.innerHTML = '<i class="fas fa-play"></i>';
    document.body.classList.add('paused-background');
  }

  stop() {
    this.worker.postMessage({ command: 'stop', studyTime: this.studyTimeMin });
    this.isRunning = false;
    this.minutes = this.studyTimeMin;
    this.seconds = 0;
    this.isBreak = false;
    this.#render();
    this.els.start.innerHTML = '<i class="fas fa-play"></i>';
    this.els.stop.disabled = true;
  }

  reset() {
    this.stop();
    this.cyclesCompleted = 0;
    this.els.cycles.textContent = `Completed cycles: ${this.cyclesCompleted}`;
    document.body.classList.remove('finished-background');
    this.els.start.innerHTML = '<i class="fas fa-play"></i>';
  }

  #updateSettings() {
    this.studyTimeMin = parseInt(this.els.studyInput.value, 10) || DEFAULT_STUDY_TIME_MIN;
    this.breakTimeMin = parseInt(this.els.breakInput.value, 10) || DEFAULT_BREAK_TIME_MIN;
    this.els.studyValue.textContent = this.studyTimeMin;
    this.els.breakValue.textContent = this.breakTimeMin;
    this.worker.postMessage({ command: 'updateSettings', studyTime: this.studyTimeMin, breakTime: this.breakTimeMin });
    if (!this.isRunning) {
      this.minutes = this.studyTimeMin;
      this.seconds = 0;
      this.#render();
    }
  }

  #onCycleComplete(isBreakFromWorker) {
    this.isBreak = isBreakFromWorker;
    if (this.isBreak) {
      this.minutes = this.breakTimeMin;
      this.cyclesCompleted++;
      this.els.cycles.textContent = `Completed cycles: ${this.cyclesCompleted}`;
      document.body.classList.add('finished-background');
      this.sounds.play('wolf');
    } else {
      this.minutes = this.studyTimeMin;
      document.body.classList.remove('finished-background');
      this.sounds.play('beep');
    }
    this.seconds = 0;
    this.#render();
    this.start();
  }

  #render() {
    const fmt = (t) => (t < 10 ? `0${t}` : `${t}`);
    this.els.display.textContent = `${fmt(this.minutes)}:${fmt(this.seconds)}`;
  }
}
