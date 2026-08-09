// --- Pixel Night Sky Background ---
function createStars() {
    const container = document.querySelector('.pixel-container');
    for (let i = 0; i < 80; i++) {
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
        container.appendChild(star);
    }
    createConstellations();
}
function createConstellations() {
    const container = document.querySelector('.pixel-container');
    const constellations = [
        [
            {x: 20, y: 15},
            {x: 25, y: 20},
            {x: 30, y: 15}
        ],
        [
            {x: 60, y: 25},
            {x: 65, y: 23},
            {x: 70, y: 25},
            {x: 73, y: 28},
            {x: 68, y: 30},
            {x: 63, y: 28},
            {x: 62, y: 26}
        ],
        [
            {x: 80, y: 10},
            {x: 83, y: 13},
            {x: 86, y: 10},
            {x: 83, y: 7},
            {x: 83, y: 13}
        ]
    ];
    constellations.forEach(constellation => {
        constellation.forEach(point => {
            const star = document.createElement('div');
            star.className = 'star bright';
            star.style.left = point.x + '%';
            star.style.top = point.y + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(star);
        });
    });
}
function createPixelClouds() {
    const container = document.querySelector('.pixel-container');
    const cloudPatterns = [
        [
            "  ████  ",
            " ██████ ",
            "████████",
            " ██████ "
        ],
        [
            "   ██████   ",
            " ██████████ ",
            "█████████████",
            "█████████████",
            " ███████████ ",
            "  █████████  "
        ],
        [
            "    ████████    ",
            "  ████████████  ",
            " ████████████████ ",
            "██████████████████",
            "██████████████████",
            " ██████████████████",
            "  ████████████████ ",
            "   ██████████████  ",
            "    ████████████   "
        ],
        [
            " ██████████████ ",
            "█████████████████",
            "█████████████████",
            " ███████████████ ",
            "  █████████████  "
        ]
    ];
    for (let i = 0; i < 6; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        if (Math.random() > 0.5) cloud.classList.add('dark');
        if (Math.random() > 0.7) cloud.classList.add('light');
        const pattern = cloudPatterns[Math.floor(Math.random() * cloudPatterns.length)];
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
        container.appendChild(cloud);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    createPixelClouds();
    setInterval(function() {
        if (document.querySelectorAll('.cloud').length < 6) {
            createPixelClouds();
        }
    }, 15000);
});
document.addEventListener('mousemove', function(e) {
    const stars = document.querySelectorAll('.star');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    stars.forEach((star, index) => {
        const speed = 0.5 + (index % 3) * 0.2;
        star.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
    const clouds = document.querySelectorAll('.cloud');
    clouds.forEach((cloud, index) => {
        const speed = 0.3 + (index % 2) * 0.1;
        cloud.style.transform += ` translate(${mouseX * speed}px, ${mouseY * speed * 0.5}px)`;
    });
});
// --- Fim Pixel Night Sky Background ---

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
