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
