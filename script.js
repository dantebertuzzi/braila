class BrailaTimer {
    constructor() {
        this.timer = null;
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

        this.soundPlayed = false; // Adiciona uma flag para controlar se o som já foi reproduzido

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
        this.timer = setInterval(() => this.updateTimer(), 1000);
        this.isRunning = true;
        this.startButton.innerHTML = '<i class="fas fa-pause"></i>';
        this.stopButton.disabled = false;
        document.body.classList.remove('paused-background');
    }

    pauseTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.startButton.innerHTML = '<i class="fas fa-play"></i>';
        document.body.classList.add('paused-background');
    }

    stopTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.minutes = this.studyTime;
        this.seconds = 0;
        this.isBreak = false;
        this.updateTimerDisplay();
        this.startButton.innerHTML = '<i class="fas fa-play"></i>'; // Atualiza o ícone do botão para start
        this.stopButton.disabled = true;
    }
    
    resetTimer() {
        this.stopTimer();
        this.cyclesCompleted = 0;
        this.cyclesDisplay.textContent = `Completed cycles: ${this.cyclesCompleted}`;
        document.body.classList.remove('finished-background');
        this.startButton.innerHTML = '<i class="fas fa-play"></i>'; // Atualiza o ícone do botão para start
    }
    

    updateSettings() {
        this.studyTime = parseInt(this.studyTimeInput.value);
        this.breakTime = parseInt(this.breakTimeInput.value);
        this.studyValue.textContent = this.studyTime;
        this.breakValue.textContent = this.breakTime;
        if (!this.isRunning) {
            this.minutes = this.studyTime;
            this.seconds = 0;
            this.updateTimerDisplay();
        }
    }

    updateTimer() {
        if (this.minutes === 0 && this.seconds === 0) {
            if (this.isBreak) {
                this.minutes = this.studyTime;
                this.isBreak = false;
                document.body.classList.remove('finished-background');
            } else {
                this.minutes = this.breakTime;
                this.isBreak = true;
                this.cyclesCompleted++;
                this.cyclesDisplay.textContent = `Completed cycles: ${this.cyclesCompleted}`;
                document.body.classList.add('finished-background');
            }
            this.playSound('beep.mp3');
        } else if (this.seconds === 0) {
            this.minutes--;
            this.seconds = 59;
        } else {
            this.seconds--;
        }
        this.updateTimerDisplay();
    }
    

    playSound(soundFile) {
        const audio = new Audio(soundFile);
        audio.play();
    }
       
    

    updateTimerDisplay() {
        const minutesDisplay = this.formatTime(this.minutes);
        const secondsDisplay = this.formatTime(this.seconds);
        this.timerDisplay.textContent = `${minutesDisplay}:${secondsDisplay}`;
    }

    formatTime(time) {
        return time < 10? `0${time}` : time;
    }

    playSound(soundFile) {
        const audio = new Audio(soundFile);
        audio.play();
    }
}

const braila = new BrailaTimer();
