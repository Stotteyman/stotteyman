window.addEventListener("load", function () {
    const audioElements = document.querySelectorAll("audio");
  
    audioElements.forEach(function (audio) {
      const playPauseButtons = audio.previousElementSibling;
  
      playPauseButtons.addEventListener("click", function () {
        if (audio.paused) {
          audio.play();
          playPauseButtons.classList.add("playing");
        } else {
          audio.pause();
          playPauseButtons.classList.remove("playing");
        }
      });
  
      audio.addEventListener("ended", function () {
        playPauseButtons.classList.remove("playing");
      });
    });
  });
  