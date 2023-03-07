const beats = [
  {
    name: 'Beat 1',
    imageSrc: 'beat1.jpg',
    audioSrc: 'beat1.mp3',
    buyLink: 'https://www.google.com'
  },
  {
    name: 'Beat 2',
    imageSrc: 'beat2.jpg',
    audioSrc: 'beat2.mp3',
    buyLink: 'https://www.google.com'
  },
  {
    name: 'Beat 3',
    imageSrc: 'beat3.jpg',
    audioSrc: 'beat3.mp3',
    buyLink: 'https://www.google.com'
  },
  {
    name: 'Beat 4',
    imageSrc: 'beat4.jpg',
    audioSrc: 'beat4.mp3',
    buyLink: 'https://www.google.com'
  }
];

const audioPlayers = document.querySelectorAll('.audio-player');
const beatContainers = document.querySelectorAll('.beat');

beatContainers.forEach((beatContainer, index) => {
  const audioPlayer = audioPlayers[index];
  const beatImage = beatContainer.querySelector('img');
  const beatInfo = beatContainer.querySelector('.beat-info');
  const buyNowButton = beatContainer.querySelector('.buy-now-btn');
  const playIcon = beatContainer.querySelector('.play-icon');
  const pauseIcon = beatContainer.querySelector('.pause-icon');

  beatContainer.addEventListener('mouseover', () => {
    playIcon.style.opacity = 1;
  });

  beatContainer.addEventListener('mouseout', () => {
    playIcon.style.opacity = 0;
  });

  beatContainer.addEventListener('click
