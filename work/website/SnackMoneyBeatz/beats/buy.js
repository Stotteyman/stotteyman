const buyButtons = document.querySelectorAll('.popup-buy-btn');

buyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const beatName = button.parentElement.parentElement.querySelector('h3').innerText;
    window.location.href = `
    https://snackmoneybeatz.page.link/${beatName}`;
  });
});
