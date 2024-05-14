let intervalId;
let minutes;
let seconds;
let studyTime;
let breakTime;
let isBreak = false;

self.onmessage = function(e) {
    const data = e.data;
    switch(data.command) {
        case 'start':
            startTimer(data.minutes, data.seconds);
            break;
        case 'pause':
            clearInterval(intervalId);
            break;
        case 'stop':
            clearInterval(intervalId);
            isBreak = false;
            self.postMessage({ type: 'update', minutes: data.studyTime, seconds: 0 });
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
                self.postMessage({ type: 'cycleComplete' });
                isBreak = !isBreak;
                if (isBreak) {
                    minutes = breakTime;
                } else {
                    minutes = studyTime;
                }
                seconds = 0;
                startTimer(minutes, seconds);
            } else {
                minutes--;
                seconds = 59;
            }
        } else {
            seconds--;
        }
        self.postMessage({ type: 'update', minutes: minutes, seconds: seconds });
    }, 1000);
}
