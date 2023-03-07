const beats = document.querySelectorAll('.beat');

beats.forEach((beat) => {
  const beatImg = beat.querySelector('img');
  let isPlaying = false;
  let audio;

  beatImg.addEventListener('click', () => {
    if (!isPlaying) {
      // Pause any currently playing audio
      stopAllAudio();
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

function stopAllAudio() {
  beats.forEach((beat) => {
    const audio = beat.querySelector('audio');
    const beatImg = beat.querySelector('img');
    beatImg.classList.remove('active');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}
