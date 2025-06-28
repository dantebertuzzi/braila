let intervalId = null;
let minutes = 0;
let seconds = 0;
let studyTime = 25; // valor padrão
let breakTime = 5;  // valor padrão
let isBreak = false;

self.onmessage = function(e) {
    const data = e.data;
    switch(data.command) {
        case 'start':
            if (intervalId) clearInterval(intervalId); // evita múltiplos intervalos
            startTimer(data.minutes, data.seconds);
            break;
        case 'pause':
            clearInterval(intervalId);
            intervalId = null;
            break;
        case 'stop':
            clearInterval(intervalId);
            intervalId = null;
            isBreak = false;
            minutes = studyTime;
            seconds = 0;
            self.postMessage({ type: 'update', minutes, seconds });
            break;
        case 'updateSettings':
            studyTime = data.studyTime;
            breakTime = data.breakTime;
            if (!isBreak) {
                minutes = studyTime;
                seconds = 0;
            }
            break;
    }
};

function startTimer(startMinutes, startSeconds) {
    minutes = startMinutes;
    seconds = startSeconds;

    intervalId = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(intervalId);
                intervalId = null;
                self.postMessage({ type: 'cycleComplete', isBreak: !isBreak });
                isBreak = !isBreak;
                minutes = isBreak ? breakTime : studyTime;
                seconds = 0;
                // O timer só reinicia se desejar, senão remova a linha abaixo
                // startTimer(minutes, seconds);
            } else {
                minutes--;
                seconds = 59;
            }
        } else {
            seconds--;
        }
        self.postMessage({ type: 'update', minutes, seconds });
    }, 1000);
}
