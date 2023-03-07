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
  
  const audioPlayers = document.querySelectorAll('.audio');
  const beatContainers = document.querySelectorAll('.beat');
  
  beatContainers.forEach((beatContainer, index) => {
    const audioPlayer = audioPlayers[index];
    const beatImage = beatContainer.querySelector('img');
    const beatInfo = beatContainer.querySelector('.beat-info');
    const buyNowButton = beatContainer.querySelector('.buy-btn');
  
    beatImage.addEventListener('click', () => {
      if (audioPlayer.paused) {
        audioPlayer.play();
        beatContainer.classList.add('active');
      } else {
        audioPlayer.pause();
        beatContainer.classList.remove('active');
      }
    });
  
    audioPlayer.addEventListener('ended', () => {
      beatContainer.classList.remove('active');
    });
  
    buyNowButton.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  });
  
  let currentIndex = 0;
  