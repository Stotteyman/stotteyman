const popout = document.querySelector(".popup");
const closeBtn = document.querySelector("#close-btn");
const audioPlayer = document.querySelector("#audio-player");
const popupBox = document.querySelector(".popup-box");
const mediaBar = document.querySelector(".media-bar");
const buyBtn = document.querySelector(".buy-btn");

function togglePopup() {
  popout.classList.toggle("show-popup");
  popupBox.classList.toggle("show-popup");
}

function closePopup() {
  popout.classList.remove("show-popup");
  popupBox.classList.remove("show-popup");
  audioPlayer.pause();
}

closeBtn.addEventListener("click", closePopup);

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePopup();
  }
});

buyBtn.addEventListener("click", function () {
  const audioSrc = audioPlayer.getAttribute("src");
  window.location.href = "https://www.google.com/search?q=" + audioSrc;
});

document.querySelectorAll(".play-pause").forEach(function (button) {
  button.addEventListener("click", function () {
    audioPlayer.src = button.getAttribute("data-audio");
    togglePopup();
    audioPlayer.play();
    mediaBar.style.display = "flex";
  });
});
