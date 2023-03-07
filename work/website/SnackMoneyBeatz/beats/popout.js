const playPauseButtons = document.querySelectorAll('.play-pause');
const audioPlayer = document.querySelector('#audio-player');
const popup = document.querySelector('.popup');
const popupBox = document.querySelector('.popup-box');
const closeBtn = document.querySelector('#close-btn');

playPauseButtons.forEach(button => {
  button.addEventListener('click', () => {
    const audioSrc = button.getAttribute('data-audio');
    const beatName = button.nextElementSibling.firstElementChild.innerText;

    audioPlayer.setAttribute('src', audioSrc);

    popup.style.display = 'block';
    popupBox.style.display = 'block';
    document.querySelector('body').style.overflow = 'hidden';

    const beatNameDiv = document.createElement('div');
    beatNameDiv.innerText = beatName;

    popupBox.insertBefore(beatNameDiv, audioPlayer);
  });
});

closeBtn.addEventListener('click', () => {
  popup.style.display = 'none';
  popupBox.style.display = 'none';
  document.querySelector('body').style.overflow = 'auto';

  const beatNameDiv = popupBox.firstElementChild;
  popupBox.removeChild(beatNameDiv);
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
});
