function buy() {
    const buyBtns = document.querySelectorAll(".buy-btn");
  
    buyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const audioSrc = btn.parentElement.previousElementSibling.getAttribute(
          "data-audio"
        );
        const audioPlayer = document.getElementById("audio-player");
        const audioName = btn.parentElement.querySelector("h3").textContent;
        const popout = document.querySelector(".popup");
  
        audioPlayer.src = audioSrc;
        audioPlayer.play();
        popout.classList.add("active");
        popout.querySelector("h2").textContent = audioName;
  
        const closeBtn = document.querySelector("#close-btn");
        closeBtn.addEventListener("click", () => {
          audioPlayer.pause();
          audioPlayer.currentTime = 0;
          popout.classList.remove("active");
        });
      });
    });
  }
  
  buy();
  