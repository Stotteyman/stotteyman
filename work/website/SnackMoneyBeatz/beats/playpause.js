window.addEventListener('load', function() {
    const playPauseButtons = document.querySelectorAll('.play-pause');
  
    playPauseButtons.forEach(button => {
      button.addEventListener('click', function() {
        const audio = document.getElementById('audio-player');
        const src = this.getAttribute('data-audio');
  
        if (audio.paused) {
          audio.src = src;
          audio.play();
          this.classList.add('playing');
        } else {
          audio.pause();
          this.classList.remove('playing');
        }
      });
    });
  });
  