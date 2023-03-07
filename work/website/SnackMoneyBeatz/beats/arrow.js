const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
const beatContainer = document.querySelector('.beat-list');
const beats = document.querySelectorAll('.beat');
const containerWidth = beatContainer.offsetWidth;

let currentPosition = 0;

function cycleBeats(direction) {
  currentPosition += direction * containerWidth;

  if (currentPosition > 0) {
    currentPosition = -(containerWidth * (beats.length - 1));
  } else if (currentPosition < -(containerWidth * (beats.length - 1))) {
    currentPosition = 0;
  }

  beatContainer.style.transform = `translateX(${currentPosition}px)`;
}

leftArrow.addEventListener('click', () => {
  cycleBeats(1);
});

rightArrow.addEventListener('click', () => {
  cycleBeats(-1);
});
