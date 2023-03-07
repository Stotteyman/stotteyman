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
    const beatImage = beatContainer.querySelector('.beat-image');
    const beatInfo = beatContainer.querySelector('.beat-info');
    const buyNowButton = beatContainer.querySelector('.buy-now-btn');
  
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
  
  const prevButton = document.querySelector('#prev-btn');
  const nextButton = document.querySelector('#next-btn');
  const beatList = document.querySelector('.beat-list');
  
  function renderBeats(startIndex) {
    beatList.innerHTML = '';
    for (let i = startIndex; i < startIndex + 4 && i < beats.length; i++) {
      const beat = beats[i];
  
      const beatContainer = document.createElement('div');
      beatContainer.classList.add('beat');
  
      const beatImage = document.createElement('img');
      beatImage.classList.add('beat-image');
      beatImage.src = beat.imageSrc;
      beatContainer.appendChild(beatImage);
  
      const beatInfo = document.createElement('div');
      beatInfo.classList.add('beat-info');
  
      const beatName = document.createElement('h3');
      beatName.textContent = beat.name;
      beatInfo.appendChild(beatName);
  
      const audioPlayer = document.createElement('audio');
      audioPlayer.classList.add('audio-player');
      audioPlayer.src = beat.audioSrc;
      beatInfo.appendChild(audioPlayer);
  
      const buyNowButton = document.createElement('a');
      buyNowButton.classList.add('buy-now-btn');
      buyNowButton.textContent = 'Buy Now';
      buyNowButton.href = beat.buyLink;
      beatInfo.appendChild(buyNowButton);
  
      beatContainer.appendChild(beatInfo);
  
      beatList.appendChild(beatContainer);
    }
  }
  
  renderBeats(0);
  
  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 4;
      renderBeats(currentIndex);
    }
  });
  
  nextButton.addEventListener('click', () => {
    if (currentIndex < beats.length - 4) {
      currentIndex += 4;
      renderBeats(currentIndex);
    }
  });
  