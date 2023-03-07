const beats = document.querySelectorAll('.beat');
const audioElements = document.querySelectorAll('audio');
let currentBeat = 0;

function playBeat(beatIndex) {
  const audio = audioElements[beatIndex];
  const beat = beats[beatIndex];
  if (audio.paused) {
    audio.currentTime = 0;
    audio.play();
    beat.classList.add('playing');
  } else {
    audio.pause();
    beat.classList.remove('playing');
  }
}

function stopAllBeats() {
  audioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  beats.forEach(beat => beat.classList.remove('playing'));
}

function cycleBeats(direction) {
  currentBeat += direction;
  if (currentBeat < 0) {
    currentBeat = beats.length - 1;
  } else if (currentBeat >= beats.length) {
    currentBeat = 0;
  }
  stopAllBeats();
  playBeat(currentBeat);
}

document.addEventListener('DOMContentLoaded', () => {
  beats.forEach((beat, index) => {
    beat.addEventListener('click', () => {
      stopAllBeats();
      playBeat(index);
    });
  });

  document.querySelector('.left-arrow').addEventListener('click', () => {
    cycleBeats(-1);
  });

  document.querySelector('.right-arrow').addEventListener('click', () => {
    cycleBeats(1);
  });
});
