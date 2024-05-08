let timer;
let studyTime = 25; // Tempo de estudo padrão em minutos
let breakTime = 5;  // Tempo de pausa padrão em minutos
let minutes = studyTime;
let seconds = 0;
let isRunning = false;
let isBreak = false;
let cyclesCompleted = 0;

const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const timerDisplay = document.querySelector('.time-display');
const studyTimeInput = document.getElementById('study-time');
const breakTimeInput = document.getElementById('break-time');
const studyValue = document.getElementById('study-value');
const breakValue = document.getElementById('break-value');
const cyclesDisplay = document.getElementById('cycles');

// Função para atualizar o temporizador
function updateTimer() {
    if (minutes === 0 && seconds === 0) {
        if (isBreak) {
            // Se for uma pausa, reinicia o temporizador de estudo
            minutes = studyTime;
            isBreak = false;
            document.body.classList.remove('finished-background'); // Remove a classe de fundo laranja
        } else {
            // Se for um ciclo de estudo completo, inicia a pausa
            minutes = breakTime;
            isBreak = true;
            cyclesCompleted++;
            cyclesDisplay.textContent = `Ciclos completos: ${cyclesCompleted}`;
            document.body.classList.add('finished-background'); // Adiciona a classe de fundo laranja quando o timer finalizar
        }
    } else if (seconds === 0) {
        minutes--;
        seconds = 59;
    } else {
        seconds--;
    }
    updateTimerDisplay();
    
    // Notificação sonora quando o timer zerar
    if (minutes === 0 && seconds === 0) {
        playSound('https://github.com/dantebertuzzi/braila/blob/main/beep.mp3');
    }
}

// Função para notificação sonora
function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
}

// Função para atualizar a exibição do temporizador
function updateTimerDisplay() {
    const minutesDisplay = minutes < 10 ? `0${minutes}` : minutes;
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    timerDisplay.textContent = `${minutesDisplay}:${secondsDisplay}`;
    // Atualizar o anel de progresso
    const circle = document.querySelector('.progress-ring-circle-fg');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const progress = (studyTime * 60 - (minutes * 60 + seconds)) / (studyTime * 60);
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference * (1 - progress)}`;
}

// Função para iniciar o temporizador
function startTimer() {
    timer = setInterval(updateTimer, 1000);
    isRunning = true;
    startButton.innerHTML = '<i class="fas fa-pause"></i>';
    stopButton.disabled = false;
    document.body.classList.remove('paused-background'); // Remove a classe de fundo laranja
}

// Função para pausar o temporizador
function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    startButton.innerHTML = '<i class="fas fa-play"></i>';
    document.body.classList.add('paused-background'); // Adiciona a classe de fundo laranja
}

// Função para parar o temporizador
function stopTimer() {
    clearInterval(timer);
    isRunning = false;
    minutes = studyTime;
    seconds = 0;
    isBreak = false;
    updateTimerDisplay();
    startButton.innerHTML = '<i class="fas fa-play"></i>';
    stopButton.disabled = true;
}

// Função para resetar o temporizador
function resetTimer() {
    stopTimer();
    cyclesCompleted = 0;
    cyclesDisplay.textContent = `Ciclos completos: ${cyclesCompleted}`;
    document.body.classList.remove('finished-background'); // Remove a classe de fundo laranja
}

// Função para atualizar os tempos de estudo e pausa
function updateSettings() {
    studyTime = parseInt(studyTimeInput.value);
    breakTime = parseInt(breakTimeInput.value);
    studyValue.textContent = studyTime;
    breakValue.textContent = breakTime;
    if (!isRunning) {
        minutes = studyTime;
        seconds = 0;
        updateTimerDisplay();
    }
}

// Adicionando eventos aos botões e controles deslizantes
startButton.addEventListener('click', () => {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
});
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', resetTimer);
studyTimeInput.addEventListener('input', updateSettings);
breakTimeInput.addEventListener('input', updateSettings);

// Atualiza a exibição do temporizador com os valores iniciais
updateTimerDisplay();
