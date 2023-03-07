const beats = document.querySelectorAll('.beat');

beats.forEach((beat) => {
  const beatImg = beat.querySelector('img');
  let isPlaying = false;
  let audio;

  beatImg.addEventListener('click', () => {
    if (!isPlaying) {
      audio = new Audio(beat.dataset.audio);
      audio.play();
      beat.classList.add('active');
      isPlaying = true;
    } else {
      audio.pause();
      beat.classList.remove('active');
      isPlaying = false;
    }
  });
});
