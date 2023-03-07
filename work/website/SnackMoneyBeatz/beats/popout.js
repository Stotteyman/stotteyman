const playPauseButtons = document.querySelectorAll('.play-pause');
const popupPlayPauseButton = document.querySelector('.popup-play-pause');
const popupBox = document.querySelector('.popup');
const closePopupButton = document.querySelector('#close-btn');
const popupAudioPlayer = document.querySelector('#audio-player');
const buyButtons = document.querySelectorAll('.buy-btn');

let currentAudio;

// Play/pause buttons
playPauseButtons.forEach(button => {
  button.addEventListener('click', () => {
    const audioSrc = button.getAttribute('data-audio');
    if (currentAudio && currentAudio.src.includes(audioSrc)) {
      if (currentAudio.paused) {
        currentAudio.play();
        button.src = 'pause.png';
      } else {
        currentAudio.pause();
        button.src = 'play.png';
      }
    } else {
      if (currentAudio) {
        currentAudio.pause();
        document.querySelectorAll('.play-pause').forEach(button => button.src = 'play.png');
      }
      currentAudio = new Audio(audioSrc);
      currentAudio.play();
      button.src = 'pause.png';
    }
  });
});

// Popup play/pause button
popupPlayPauseButton.addEventListener('click', () => {
  if (currentAudio.paused) {
    currentAudio.play();
    popupPlayPauseButton.src = 'popup-pause.png';
  } else {
    currentAudio.pause();
    popupPlayPauseButton.src = 'popup-play.png';
  }
});

// Buy buttons
buyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const beatName = button.parentElement.querySelector('h3').innerText;
    const beatSrc = button.parentElement.parentElement.querySelector('.play-pause').getAttribute('data-audio');
    popupBox.querySelector('h3').innerText = beatName;
    popupAudioPlayer.src = beatSrc;
    currentAudio.pause();
    popupPlayPauseButton.src = 'popup-play.png';
    popupBox.style.display = 'flex';
  });
});

// Close popup button
closePopupButton.addEventListener('click', () => {
  popupBox.style.display = 'none';
});

// Audio event listeners
currentAudio?.addEventListener('ended', () => {
  document.querySelectorAll('.play-pause').forEach(button => button.src = 'play.png');
  popupPlayPauseButton.src = 'popup-play.png';
});

popupAudioPlayer.addEventListener('play', () => {
  currentAudio.pause();
  popupPlayPauseButton.src = 'popup-pause.png';
});

popupAudioPlayer.addEventListener('pause', () => {
  currentAudio.play();
  popupPlayPauseButton.src = 'popup-play.png';
});
