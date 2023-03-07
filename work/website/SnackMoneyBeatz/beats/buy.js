const buyButtons = document.querySelectorAll('.buy-btn');
const popupTitle = document.querySelector('#popup-title');
const popupLink = document.querySelector('#popup-link');

buyButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    const beatInfo = this.closest('.beat-info');
    const title = beatInfo.querySelector('h3').innerText;
    const link = this.getAttribute('data-link');
    popupTitle.innerText = title;
    popupLink.href = link;
  });
});
