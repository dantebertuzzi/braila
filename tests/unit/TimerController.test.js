import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TimerController } from '../../src/timer/TimerController.js';

class MockWorker {
  constructor() {
    this.postMessage = vi.fn();
    this.onmessage = null;
  }
}

function buildFixture() {
  document.body.innerHTML = `
    <button id="start"><i class="fas fa-play"></i></button>
    <button id="stop"></button>
    <button id="reset"></button>
    <div class="time-display"></div>
    <input type="range" id="study-time" min="1" max="60" value="30">
    <input type="range" id="break-time" min="1" max="30" value="10">
    <span id="study-value">30</span>
    <span id="break-value">10</span>
    <div id="cycles">Completed cycles: 0</div>
  `;
}

describe('TimerController', () => {
  let controller;

  beforeEach(() => {
    vi.stubGlobal('Worker', MockWorker);
    vi.stubGlobal('Audio', class {
      play() { return Promise.resolve(); }
    });
    buildFixture();
    controller = new TimerController(document);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the default study time on load', () => {
    expect(document.querySelector('.time-display').textContent).toBe('30:00');
  });

  it('start() posts a start command and switches the button to pause', () => {
    controller.start();

    expect(controller.worker.postMessage).toHaveBeenCalledWith({
      command: 'start',
      minutes: 30,
      seconds: 0,
    });
    expect(controller.isRunning).toBe(true);
    expect(document.getElementById('start').innerHTML).toContain('fa-pause');
    expect(document.getElementById('stop').disabled).toBe(false);
  });

  it('pause() posts a pause command and switches the button back to play', () => {
    controller.start();
    controller.pause();

    expect(controller.worker.postMessage).toHaveBeenLastCalledWith({ command: 'pause' });
    expect(controller.isRunning).toBe(false);
    expect(document.getElementById('start').innerHTML).toContain('fa-play');
  });

  it('stop() resets the display to the configured study time and disables stop', () => {
    document.getElementById('study-time').value = '45';
    document.getElementById('study-time').dispatchEvent(new Event('input'));

    controller.start();
    controller.stop();

    expect(controller.worker.postMessage).toHaveBeenLastCalledWith({
      command: 'stop',
      studyTime: 45,
    });
    expect(document.querySelector('.time-display').textContent).toBe('45:00');
    expect(document.getElementById('stop').disabled).toBe(true);
  });

  it('falls back to the default study/break time when the slider value is invalid', () => {
    const studyInput = document.getElementById('study-time');
    studyInput.value = '';
    studyInput.dispatchEvent(new Event('input'));

    expect(controller.studyTimeMin).toBe(30);
    expect(document.getElementById('study-value').textContent).toBe('30');
  });

  it('updates the display when the worker reports a tick', () => {
    controller.worker.onmessage({ data: { type: 'update', minutes: 29, seconds: 59 } });

    expect(document.querySelector('.time-display').textContent).toBe('29:59');
  });

  it('on cycleComplete(isBreak: true) switches to break time and counts the cycle', () => {
    controller.worker.onmessage({ data: { type: 'cycleComplete', isBreak: true } });

    expect(document.getElementById('cycles').textContent).toBe('Completed cycles: 1');
    expect(document.body.classList.contains('finished-background')).toBe(true);
    expect(document.querySelector('.time-display').textContent).toBe('10:00');
    expect(controller.worker.postMessage).toHaveBeenLastCalledWith({
      command: 'start',
      minutes: 10,
      seconds: 0,
    });
  });

  it('on cycleComplete(isBreak: false) returns to study time and clears finished-background', () => {
    document.body.classList.add('finished-background');
    controller.worker.onmessage({ data: { type: 'cycleComplete', isBreak: false } });

    expect(document.body.classList.contains('finished-background')).toBe(false);
    expect(document.querySelector('.time-display').textContent).toBe('30:00');
  });

  it('reset() zeroes the completed cycles and clears finished-background', () => {
    controller.worker.onmessage({ data: { type: 'cycleComplete', isBreak: true } });
    controller.reset();

    expect(document.getElementById('cycles').textContent).toBe('Completed cycles: 0');
    expect(document.body.classList.contains('finished-background')).toBe(false);
  });

  it('clicking the start button wires through to toggle()', () => {
    document.getElementById('start').dispatchEvent(new MouseEvent('click'));

    expect(controller.isRunning).toBe(true);
    expect(controller.worker.postMessage).toHaveBeenCalledWith({
      command: 'start',
      minutes: 30,
      seconds: 0,
    });
  });
});
