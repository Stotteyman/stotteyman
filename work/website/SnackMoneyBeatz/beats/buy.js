const buyBtns = document.querySelectorAll(".buy-btn");

buyBtns.forEach((buyBtn) => {
  buyBtn.addEventListener("click", () => {
    const beatNumber = buyBtn.parentElement.querySelector("h3").innerHTML.split(" ")[1];
    window.location.href = `https://placeholder${beatNumber}.com`;
  });
});
