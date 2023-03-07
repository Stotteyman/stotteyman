const audioElements = document.querySelectorAll('audio');

audioElements.forEach(audio => {
  const playPauseBtn = audio.nextElementSibling;
  const playPauseIcon = playPauseBtn.querySelector('i');

  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playPauseIcon.classList.remove('fa-play');
      playPauseIcon.classList.add('fa-pause');
    } else {
      audio.pause();
      playPauseIcon.classList.remove('fa-pause');
      playPauseIcon.classList.add('fa-play');
    }
  });
});

const popout = document.querySelector('.popout');
const popoutMedia = document.querySelector('.popout-media');
const popoutTitle = document.querySelector('.popout-title');
const popoutMediaBar = document.querySelector('.popout-media-bar');
const popoutCloseBtn = document.querySelector('.popout-close');
const beats = document.querySelectorAll('.beat');
const infoButtons = document.querySelectorAll('.info');

function openPopout(beat) {
  const beatMedia = beat.querySelector('.beat-media');
  const beatTitle = beat.querySelector('.beat-title');

  popoutMedia.src = beatMedia.src;
  popoutTitle.textContent = beatTitle.textContent;

  popout.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closePopout() {
  popoutMedia.src = '';
  popoutTitle.textContent = '';
  popout.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

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

infoButtons.forEach((infoButton) => {
  infoButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const beat = event.target.closest('.beat');
    openPopout(beat);
  });
});

popoutCloseBtn.addEventListener('click', () => {
  closePopout();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && popout.classList.contains('open')) {
    closePopout();
  }
});

const buyBtn = document.querySelector('.popout-buy');
const buyLinks = {
  "beat1": "https://www.example.com/beat1",
  "beat2": "https://www.example.com/beat2",
  "beat3": "https://www.example.com/beat3"
};

buyBtn.addEventListener('click', () => {
  const popoutTitleText = popoutTitle.textContent.toLowerCase().replace(/\s/g, '');
  window.location.href = buyLinks[popoutTitleText];
});
