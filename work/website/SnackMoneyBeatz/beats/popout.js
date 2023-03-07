const beats = document.querySelectorAll('.beat');

beats.forEach(beat => {
  const audio = new Audio(beat.querySelector('img').getAttribute('data-audio'));
  const playButton = beat.querySelector('.play-button');
  const popout = beat.querySelector('.beat-popout');

  // Toggle the popout box when the beat is clicked
  beat.addEventListener('click', () => {
    popout.classList.toggle('show');
  });

  // Play or pause the audio when the play button is clicked
  playButton.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playButton.classList.add('pause');
    } else {
      audio.pause();
      playButton.classList.remove('pause');
    }
  });
});
