const popout = document.querySelector('.popout');
const popoutMedia = document.querySelector('.popout-media');
const popoutTitle = document.querySelector('.popout-title');
const popoutMediaBar = document.querySelector('.popout-media-bar');
const popoutCloseBtn = document.querySelector('.popout-close');
const beats = document.querySelectorAll('.beat');
const infoButtons = document.querySelectorAll('.info');

// function to open the popout
function openPopout(beat) {
  const beatMedia = beat.querySelector('.beat-media');
  const beatTitle = beat.querySelector('.beat-title');

  popoutMedia.src = beatMedia.src;
  popoutTitle.textContent = beatTitle.textContent;

  popout.classList.add('open');
  document.body.classList.add('no-scroll');
}

// function to close the popout
function closePopout() {
  popoutMedia.src = '';
  popoutTitle.textContent = '';
  popout.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// play/pause functionality
beats.forEach((beat) => {
  const playPauseBtn = beat.querySelector('.playpause');

  playPauseBtn.addEventListener('click', () => {
    if (beat.classList.contains('playing')) {
      beat.classList.remove('playing');
      playPauseBtn.innerHTML = 'play_circle_outline';
    } else {
      beats.forEach((otherBeat) => {
        otherBeat.classList.remove('playing');
        otherBeat.querySelector('.playpause').innerHTML = 'play_circle_outline';
      });

      beat.classList.add('playing');
      playPauseBtn.innerHTML = 'pause_circle_outline';
    }
  });
});

// open popout when info button is clicked
infoButtons.forEach((infoButton) => {
  infoButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const beat = event.target.closest('.beat');
    openPopout(beat);
  });
});

// close popout when close button is clicked
popoutCloseBtn.addEventListener('click', () => {
  closePopout();
});

// close popout when escape key is pressed
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && popout.classList.contains('open')) {
    closePopout();
  }
});

// redirect to purchase page when buy button is clicked in popout
const buyBtn = document.querySelector('.popout-buy');

buyBtn.addEventListener('click', () => {
  window.location.href = 'https://www.google.com';
});

