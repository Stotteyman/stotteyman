const buyButtons = document.querySelectorAll('.buy-btn');

buyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const beatName = button.parentElement.querySelector('h3').textContent;
    const audioSrc = button.parentElement.parentElement.querySelector('img').getAttribute('data-audio');
    const audioPlayer = document.querySelector('#audio-player');
    const popup = document.querySelector('.popup');
    const closeBtn = document.querySelector('#close-btn');
    const buyLink = button.getAttribute('data-buy');

    audioPlayer.src = audioSrc;
    audioPlayer.play();

    popup.style.display = 'block';

    const popupBeatName = popup.querySelector('h3');
    popupBeatName.textContent = beatName;

    const buyBtn = popup.querySelector('.buy-btn');
    buyBtn.setAttribute('href', buyLink);

    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
      audioPlayer.pause();
    });
  });
});
