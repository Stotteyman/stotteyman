const playPauseButtons = document.querySelectorAll('.play-pause');

playPauseButtons.forEach(button => {
  button.addEventListener('click', function() {
    const audio = new Audio(this.dataset.audio);
    const isPlaying = !audio.paused;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    this.classList.toggle('playing', !isPlaying);
  });
});
