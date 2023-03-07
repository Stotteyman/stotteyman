const playButtons = document.querySelectorAll(".play-pause");
const audioPlayer = document.querySelector("#audio-player");
const popup = document.querySelector(".popup");
const popupImage = document.querySelector(".popup-img");
const popupTitle = document.querySelector(".popup-title");
const popupBuyBtn = document.querySelector(".popup-buy-btn");
const closeBtn = document.querySelector("#close-btn");

playButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const audioFile = button.getAttribute("data-audio");
    audioPlayer.setAttribute("src", audioFile);

    popupImage.setAttribute("src", button.getAttribute("src"));
    popupTitle.textContent = button.nextElementSibling.querySelector("h3").textContent;
    popupBuyBtn.setAttribute("href", button.nextElementSibling.querySelector(".buy-btn").getAttribute("data-buy-link"));

    popup.classList.add("open");
    audioPlayer.play();
  });
});

closeBtn.addEventListener("click", () => {
  popup.classList.remove("open");
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    popup.classList.remove("open");
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
});
