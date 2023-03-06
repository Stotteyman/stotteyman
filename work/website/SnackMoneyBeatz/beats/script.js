const beatList = document.querySelector('.beat-list');
const beats = document.querySelectorAll('.beat');
const prevBtn = document.querySelector('#prev-btn');
const nextBtn = document.querySelector('#next-btn');

let currentBeat = 0;
const beatWidth = beats[0].clientWidth;

prevBtn.addEventListener('click', () => {
    currentBeat--;
    if (currentBeat < 0) {
        currentBeat = beats.length - 1;
    }
    beatList.style.transform = `translateX(-${currentBeat * beatWidth}px)`;
});

nextBtn.addEventListener('click', () => {
    currentBeat++;
    if (currentBeat >= beats.length) {
        currentBeat = 0;
    }
    beatList.style.transform = `translateX(-${currentBeat * beatWidth}px)`;
});
