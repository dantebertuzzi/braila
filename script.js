class BrailaTimer {
    constructor() {
        this.timerWorker = new Worker('timerWorker.js');
        this.studyTime = 30; // Tempo de estudo padrão em minutos
        this.breakTime = 10;  // Tempo de pausa padrão em minutos
        this.minutes = this.studyTime;
        this.seconds = 0;
        this.isRunning = false;
        this.isBreak = false;
        this.cyclesCompleted = 0;

        this.startButton = document.getElementById('start');
        this.stopButton = document.getElementById('stop');
        this.resetButton = document.getElementById('reset');
        this.timerDisplay = document.querySelector('.time-display');
        this.studyTimeInput = document.getElementById('study-time');
        this.breakTimeInput = document.getElementById('break-time');
        this.studyValue = document.getElementById('study-value');
        this.breakValue = document.getElementById('break-value');
        this.cyclesDisplay = document.getElementById('cycles');

        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.stopButton.addEventListener('click', () => this.stopTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.studyTimeInput.addEventListener('input', () => this.updateSettings());
        this.breakTimeInput.addEventListener('input', () => this.updateSettings());

        this.timerWorker.onmessage = (e) => {
            const data = e.data;
            switch (data.type) {
                case 'update':
                    this.minutes = data.minutes;
                    this.seconds = data.seconds;
                    this.updateTimerDisplay();
                    break;
                case 'cycleComplete':
                    this.handleCycleComplete(data.isBreak);
                    break;
            }
        };

        this.updateTimerDisplay();
    }

    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
        } else {
            this.pauseTimer();
        }
    }

    startTimer() {
        this.timerWorker.postMessage({
            command: 'start',
            minutes: this.minutes,
            seconds: this.seconds
        });
        this.isRunning = true;
        this.startButton.innerHTML = '<i class="fas fa-pause"></i>';
        this.stopButton.disabled = false;
        document.body.classList.remove('paused-background');
    }

    pauseTimer() {
        this.timerWorker.postMessage({ command: 'pause' });
        this.isRunning = false;
        this.startButton.innerHTML = '<i class="fas fa-play"></i>';
        document.body.classList.add('paused-background');
    }

    stopTimer() {
        this.timerWorker.postMessage({ command: 'stop', studyTime: this.studyTime });
        this.isRunning = false;
        this.minutes = this.studyTime;
        this.seconds = 0;
        this.isBreak = false;
        this.updateTimerDisplay();
        this.startButton.innerHTML = '<i class="fas fa-play"></i>';
        this.stopButton.disabled = true;
    }

    resetTimer() {
        this.stopTimer();
        this.cyclesCompleted = 0;
        this.cyclesDisplay.textContent = `Completed cycles: ${this.cyclesCompleted}`;
        document.body.classList.remove('finished-background');
        this.startButton.innerHTML = '<i class="fas fa-play"></i>';
    }

    updateSettings() {
        this.studyTime = parseInt(this.studyTimeInput.value) || 30;
        this.breakTime = parseInt(this.breakTimeInput.value) || 10;
        this.studyValue.textContent = this.studyTime;
        this.breakValue.textContent = this.breakTime;
        this.timerWorker.postMessage({ command: 'updateSettings', studyTime: this.studyTime, breakTime: this.breakTime });
        if (!this.isRunning) {
            this.minutes = this.studyTime;
            this.seconds = 0;
            this.updateTimerDisplay();
        }
    }

    handleCycleComplete(isBreakFromWorker) {
        this.isBreak = isBreakFromWorker;
        if (this.isBreak) {
            this.minutes = this.breakTime;
            this.cyclesCompleted++;
            this.cyclesDisplay.textContent = `Completed cycles: ${this.cyclesCompleted}`;
            document.body.classList.add('finished-background');
            this.playSound('wolf.mp3'); // Toca o som do lobo ao entrar no break
        } else {
            this.minutes = this.studyTime;
            document.body.classList.remove('finished-background');
            this.playSound('beep.mp3'); // Toca beep ao voltar para estudo
        }
        this.seconds = 0;
        this.updateTimerDisplay();
        this.startTimer(); // Reinicia automaticamente o próximo ciclo
    }

    updateTimerDisplay() {
        const minutesDisplay = this.formatTime(this.minutes);
        const secondsDisplay = this.formatTime(this.seconds);
        this.timerDisplay.textContent = `${minutesDisplay}:${secondsDisplay}`;
    }

    formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    playSound(soundFile) {
        const audio = new Audio(soundFile);
        audio.play();
    }
}

const braila = new BrailaTimer();
