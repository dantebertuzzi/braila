let minutes;
let seconds;
let isRunning = false;

self.onmessage = function(e) {
    const data = e.data;
    switch (data.command) {
        case 'start':
            if (!isRunning) {
                isRunning = true;
                minutes = data.minutes;
                seconds = data.seconds;
                timer();
            }
            break;
        case 'pause':
            isRunning = false;
            break;
        case 'stop':
            isRunning = false;
            minutes = data.studyTime;
            seconds = 0;
            postMessage({ type: 'update', minutes, seconds });
            break;
        case 'reset':
            isRunning = false;
            minutes = data.studyTime;
            seconds = 0;
            postMessage({ type: 'update', minutes, seconds });
            break;
        case 'updateSettings':
            minutes = data.studyTime;
            seconds = 0;
            postMessage({ type: 'update', minutes, seconds });
            break;
    }
};

function timer() {
    if (!isRunning) return;
    
    if (minutes === 0 && seconds === 0) {
        postMessage({ type: 'cycleComplete' });
    } else if (seconds === 0) {
        minutes--;
        seconds = 59;
    } else {
        seconds--;
    }

    postMessage({ type: 'update', minutes, seconds });
    
    setTimeout(timer, 1000);
}