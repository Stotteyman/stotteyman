window.addEventListener("load", function() {
    let audioElements = document.querySelectorAll("audio");
  
    audioElements.forEach(function(audio) {
      let playPauseButton = audio.previousElementSibling;
  
      playPauseButton.addEventListener("click", function() {
        if (audio.paused) {
          audio.play();
          playPauseButton.classList.add("playing");
        } else {
          audio.pause();
          playPauseButton.classList.remove("playing");
        }
      });
  
      audio.addEventListener("ended", function() {
        playPauseButton.classList.remove("playing");
      });
    });
  });
  