// playpause.js
const audioElements = document.querySelectorAll("audio");
const playPauseButtons = document.querySelectorAll(".play-pause");

// Pause all audio elements except the one passed in as an argument
function pauseAllAudioElements(except) {
  audioElements.forEach(function(audio) {
    if (audio !== except) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
}

// Handle clicks on play/pause buttons
playPauseButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    const audio = document.querySelector(`audio[src="${this.dataset.audio}"]`);

    // Pause all audio elements except the one that was just clicked
    pauseAllAudioElements(audio);

    // Play or pause the audio element, depending on its current state
    if (audio.paused) {
      audio.play();
      this.classList.add("playing");
    } else {
      audio.pause();
      audio.currentTime = 0;
      this.classList.remove("playing");
    }
  });
});

// Stop all audio elements when the window is unloaded
window.addEventListener("unload", function() {
  pauseAllAudioElements();
});
