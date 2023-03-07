// Get the popup
var popup = document.querySelector(".popup");

// Get the close button
var closeBtn = document.querySelector("#close-btn");

// Get all the play/pause buttons
var playPauseBtns = document.querySelectorAll(".play-pause");

// Get the popup play/pause button
var popupPlayPauseBtn = document.querySelector(".popup-play-pause");

// Get the audio player
var audioPlayer = document.querySelector("#audio-player");

// Add event listeners to all the play/pause buttons
playPauseBtns.forEach(function (playPauseBtn) {
  playPauseBtn.addEventListener("click", function () {
    var audioFile = this.getAttribute("data-audio");

    // Set the audio source and play the audio
    audioPlayer.src = audioFile;
    audioPlayer.play();

    // Show the popup
    popup.classList.add("show");

    // Update the popup play/pause button
    popupPlayPauseBtn.src = this.src;
    popupPlayPauseBtn.setAttribute("data-audio", audioFile);

    // Update the popup beat info
    var beatInfo = this.parentElement.querySelector(".beat-info");
    var popupBeatInfo = document.querySelector(".popup-beat-info");
    popupBeatInfo.querySelector("h3").innerHTML = beatInfo.querySelector("h3").innerHTML;
  });
});

// Add event listener to the close button
closeBtn.addEventListener("click", function () {
  // Pause the audio and hide the popup
  audioPlayer.pause();
  popup.classList.remove("show");
});

// Add event listener to the popup play/pause button
popupPlayPauseBtn.addEventListener("click", function () {
  if (audioPlayer.paused) {
    audioPlayer.play();
    this.src = "pause.png";
  } else {
    audioPlayer.pause();
    this.src = this.getAttribute("data-play-img");
  }
});

// Add event listener to the audio player to update the popup play/pause button
audioPlayer.addEventListener("play", function () {
  popupPlayPauseBtn.src = "pause.png";
});

audioPlayer.addEventListener("pause", function () {
  popupPlayPauseBtn.src = popupPlayPauseBtn.getAttribute("data-play-img");
});
