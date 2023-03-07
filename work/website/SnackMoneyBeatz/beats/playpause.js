const playPauseButtons = document.querySelectorAll('.play-pause');
const audioPlayer = document.getElementById('audio-player');

playPauseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const audioSrc = button.getAttribute('data-audio');
    if (audioPlayer.getAttribute('src') !== audioSrc) {
      audioPlayer.setAttribute('src', audioSrc);
    }
    if (audioPlayer.paused) {
      audioPlayer.play();
      button.setAttribute('src', 'pause.png');
    } else {
      audioPlayer.pause();
      button.setAttribute('src', 'play.png');
    }
  });
});
