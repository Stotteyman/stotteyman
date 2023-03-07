const popups = document.querySelectorAll(".play-pause");

popups.forEach((popup) => {
  popup.addEventListener("click", () => {
    const audioSrc = popup.getAttribute("data-audio");
    const audioPlayer = document.querySelector("#audio-player");
    audioPlayer.setAttribute("src", audioSrc);
    const popout = document.querySelector(".popup");
    popout.classList.toggle("show");
  });
});

const closeBtn = document.querySelector("#close-btn");
closeBtn.addEventListener("click", () => {
  const popout = document.querySelector(".popup");
  popout.classList.toggle("show");
  const audioPlayer = document.querySelector("#audio-player");
  audioPlayer.pause();
});
