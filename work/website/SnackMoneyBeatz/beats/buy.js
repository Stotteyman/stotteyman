const buyButtons = document.querySelectorAll(".buy-button");

buyButtons.forEach(function (buyButton) {
  buyButton.addEventListener("click", function () {
    const beatBox = this.parentNode.parentNode;
    const beatName = beatBox.querySelector(".beat-name").textContent;
    const beatImageSrc = beatBox.querySelector(".beat-image").src;

    const popout = document.createElement("div");
    popout.classList.add("popout");

    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.innerHTML = "&times;";
    closeButton.addEventListener("click", function () {
      document.body.removeChild(popout);
    });

    const popoutContent = document.createElement("div");
    popoutContent.classList.add("popout-content");

    const beatImage = document.createElement("img");
    beatImage.classList.add("beat-image-popout");
    beatImage.src = beatImageSrc;

    const beatNamePopout = document.createElement("h3");
    beatNamePopout.classList.add("beat-name-popout");
    beatNamePopout.textContent = beatName;

    const buyButtonPopout = document.createElement("a");
    buyButtonPopout.classList.add("buy-button-popout");
    buyButtonPopout.textContent = "Buy Now";
    buyButtonPopout.href = "#"; // Add the placeholder link for the buy button

    popoutContent.appendChild(beatImage);
    popoutContent.appendChild(beatNamePopout);
    popoutContent.appendChild(buyButtonPopout);
    popout.appendChild(closeButton);
    popout.appendChild(popoutContent);

    document.body.appendChild(popout);
  });
});
