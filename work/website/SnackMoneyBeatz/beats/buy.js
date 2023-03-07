const buyButtons = document.querySelectorAll('.buy-btn');
const popup = document.querySelector('.popup');
const closeButton = document.getElementById('close-btn');
const beatImage = document.getElementById('beat-image');
const beatName = document.getElementById('beat-name');
const mediaBar = document.getElementById('media-bar');
const buyNowButton = document.getElementById('buy-now-btn');
const infoButton = document.getElementById('info-btn');

buyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const beatInfo = button.parentNode.parentNode;
    const beatSrc = beatInfo.querySelector('.play-pause').getAttribute('data-audio');
    const beatTitle = beatInfo.querySelector('h3').textContent;
    const buyLink = 'https://www.google.com/search?q=' + encodeURIComponent(beatTitle);

    beatImage.setAttribute('src', beatInfo.querySelector('img').getAttribute('src'));
    beatName.textContent = beatTitle;
    mediaBar.innerHTML = '<audio controls src="' + beatSrc + '"></audio>';
    buyNowButton.setAttribute('href', buyLink);

    popup.style.display = 'flex';
    document.body.classList.add('popup-active');
  });
});

closeButton.addEventListener('click', () => {
  popup.style.display = 'none';
  document.body.classList.remove('popup-active');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && popup.style.display === 'flex') {
    popup.style.display = 'none';
    document.body.classList.remove('popup-active');
  }
});

infoButton.addEventListener('click', () => {
  const beatInfo = infoButton.parentNode.parentNode;
  const beatSrc = beatInfo.querySelector('.play-pause').getAttribute('data-audio');
  const beatTitle = beatInfo.querySelector('h3').textContent;
  const buyLink = 'https://www.google.com/search?q=' + encodeURIComponent(beatTitle);

  beatImage.setAttribute('src', beatInfo.querySelector('img').getAttribute('src'));
  beatName.textContent = beatTitle;
  mediaBar.innerHTML = '<audio controls src="' + beatSrc + '"></audio>';
  buyNowButton.setAttribute('href', buyLink);

  popup.style.display = 'flex';
  document.body.classList.add('popup-active');
});
