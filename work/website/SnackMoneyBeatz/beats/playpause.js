const playPauseButtons = document.querySelectorAll('.play-pause');

playPauseButtons.forEach(button => {
  const audioFile = button.getAttribute('data-audio');
  const audio = new Audio(audioFile);

  button.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      button.src = 'pause.png';
    } else {
      audio.pause();
      button.src = 'play.png';
    }
  });

  audio.addEventListener('ended', () => {
    button.src = 'play.png';
  });
});
