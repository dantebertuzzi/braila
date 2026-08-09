import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('timer.worker', () => {
  let mockSelf;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    mockSelf = { postMessage: vi.fn(), onmessage: null };
    vi.stubGlobal('self', mockSelf);
    await import('../../src/timer/timer.worker.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function send(command) {
    mockSelf.onmessage({ data: command });
  }

  it('ticks down every second and posts updates', () => {
    send({ command: 'start', minutes: 0, seconds: 2 });

    vi.advanceTimersByTime(1000);
    expect(mockSelf.postMessage).toHaveBeenLastCalledWith({ type: 'update', minutes: 0, seconds: 1 });

    vi.advanceTimersByTime(1000);
    expect(mockSelf.postMessage).toHaveBeenLastCalledWith({ type: 'update', minutes: 0, seconds: 0 });
  });

  it('emits cycleComplete when the countdown reaches zero', () => {
    send({ command: 'start', minutes: 0, seconds: 1 });

    vi.advanceTimersByTime(1000); // reaches 0:00
    vi.advanceTimersByTime(1000); // next tick triggers the transition

    expect(mockSelf.postMessage).toHaveBeenCalledWith({ type: 'cycleComplete', isBreak: true });
  });

  it('stop uses the studyTime sent from the main thread, not a stale internal default', () => {
    // Regression test: `stop` previously reset to the worker's own local
    // `studyTime` (defaulted to 30 via DEFAULT_STUDY_TIME_MIN) instead of the
    // value the main thread actually asked for.
    send({ command: 'stop', studyTime: 45 });

    expect(mockSelf.postMessage).toHaveBeenLastCalledWith({ type: 'update', minutes: 45, seconds: 0 });
  });

  it('pause halts the countdown and stops posting updates', () => {
    send({ command: 'start', minutes: 0, seconds: 5 });
    send({ command: 'pause' });
    mockSelf.postMessage.mockClear();

    vi.advanceTimersByTime(5000);

    expect(mockSelf.postMessage).not.toHaveBeenCalled();
  });

  it('updateSettings applies the new study time immediately when not on break', () => {
    send({ command: 'updateSettings', studyTime: 50, breakTime: 15 });
    send({ command: 'start', minutes: 50, seconds: 0 });

    vi.advanceTimersByTime(1000);

    expect(mockSelf.postMessage).toHaveBeenLastCalledWith({ type: 'update', minutes: 49, seconds: 59 });
  });
});
