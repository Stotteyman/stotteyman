const beats = document.querySelectorAll('.beat');

beats.forEach((beat) => {
  const beatImg = beat.querySelector('img');
  let isPlaying = false;
  let audio;

  beatImg.addEventListener('click', () => {
    if (!isPlaying) {
      stopAllBeats();
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

function stopAllBeats() {
  beats.forEach((beat) => {
    const audio = new Audio(beat.dataset.audio);
    if (beat.classList.contains('active')) {
      beat.classList.remove('active');
      audio.pause();
      audio.currentTime = 0;
    }
  });
}
