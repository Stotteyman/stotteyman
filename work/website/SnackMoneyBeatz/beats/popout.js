const beats = document.querySelectorAll(".beat");

beats.forEach((beat) => {
  const popup = document.querySelector(".popup");
  const popupBox = document.querySelector(".popup-box");
  const closeBtn = document.querySelector("#close-btn");
  const popupPlayPause = document.querySelector(".popup-play-pause");
  const popupAudioPlayer = document.querySelector("#audio-player");
  const popupBuyBtn = document.querySelector(".popup-buy-btn");
  const popupBeatInfo = document.querySelector(".popup-beat-info");

  beat.addEventListener("click", () => {
    popup.classList.add("show");
    popupPlayPause.setAttribute("src", beat.querySelector(".play-pause").getAttribute("src"));
    popupAudioPlayer.setAttribute("src", beat.querySelector(".play-pause").getAttribute("data-audio"));
    popupBeatInfo.querySelector("h3").innerHTML = beat.querySelector("h3").innerHTML;
    popupBox.style.backgroundImage = `url(${beat.querySelector("img").getAttribute("src")})`;
  });

  closeBtn.addEventListener("click", () => {
    popup.classList.remove("show");
    popupAudioPlayer.pause();
    popupAudioPlayer.currentTime = 0;
  });

  popupBuyBtn.addEventListener("click", () => {
    const beatNumber = popupBeatInfo.querySelector("h3").innerHTML.split(" ")[1];
    window.location.href = `https://placeholder${beatNumber}.com`;
  });
});
