// --- Pixel Night City Background ---
function createStars() {
    const container = document.querySelector('.pixel-container');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        if (Math.random() > 0.8) star.classList.add('big');
        if (Math.random() > 0.9) star.classList.add('cross');
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 60 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(star);
    }
}
function createClouds() {
    const container = document.querySelector('.pixel-container');
    for (let i = 0; i < 8; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        if (Math.random() > 0.6) cloud.classList.add('pink');
        if (Math.random() > 0.7) cloud.classList.add('orange');
        const width = 80 + Math.random() * 120;
        const height = 20 + Math.random() * 30;
        cloud.style.width = width + 'px';
        cloud.style.height = height + 'px';
        cloud.style.top = Math.random() * 40 + '%';
        cloud.style.left = -width + 'px';
        cloud.style.animationDelay = Math.random() * 20 + 's';
        cloud.style.animationDuration = (15 + Math.random() * 20) + 's';
        container.appendChild(cloud);
    }
}
function createBuildings() {
    const container = document.querySelector('.pixel-container');
    const buildingCount = 15;
    for (let i = 0; i < buildingCount; i++) {
        const building = document.createElement('div');
        building.className = 'building';
        const width = 40 + Math.random() * 80;
        const height = 100 + Math.random() * 200;
        building.style.width = width + 'px';
        building.style.height = height + 'px';
        building.style.left = (i * (100 / buildingCount)) + '%';
        const windowsX = Math.floor(width / 15);
        const windowsY = Math.floor(height / 20);
        for (let x = 0; x < windowsX; x++) {
            for (let y = 0; y < windowsY; y++) {
                if (Math.random() > 0.3) {
                    const window = document.createElement('div');
                    window.className = 'window';
                    if (Math.random() > 0.7) window.classList.add('off');
                    window.style.left = (x * 15 + 5) + 'px';
                    window.style.top = (y * 20 + 5) + 'px';
                    window.style.animationDelay = Math.random() * 4 + 's';
                    building.appendChild(window);
                }
            }
        }
        container.appendChild(building);
    }
}
function createTrees() {
    const container = document.querySelector('.pixel-container');
    for (let i = 0; i < 8; i++) {
        const tree = document.createElement('div');
        tree.className = 'tree';
        const trunk = document.createElement('div');
        trunk.className = 'tree-trunk';
        const leaves = document.createElement('div');
        leaves.className = 'tree-leaves';
        tree.appendChild(trunk);
        tree.appendChild(leaves);
        tree.style.left = Math.random() * 100 + '%';
        tree.style.zIndex = '-1';
        container.appendChild(tree);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    createClouds();
    createBuildings();
    createTrees();
    setInterval(function() {
        if (document.querySelectorAll('.cloud').length < 8) {
            createClouds();
        }
    }, 10000);
});
document.addEventListener('mousemove', function(e) {
    const stars = document.querySelectorAll('.star');
    const clouds = document.querySelectorAll('.cloud');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    stars.forEach((star, index) => {
        const speed = 0.5 + (index % 3) * 0.2;
        star.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
    clouds.forEach((cloud, index) => {
        const speed = 0.3 + (index % 2) * 0.1;
        cloud.style.transform += ` translate(${mouseX * speed}px, ${mouseY * speed * 0.5}px)`;
    });
});
// --- Fim Pixel Night City Background ---

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
