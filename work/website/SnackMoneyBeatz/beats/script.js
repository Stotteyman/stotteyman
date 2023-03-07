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
  // Get container element and all its children
const container = document.querySelector('.container');
const beats = container.querySelectorAll('.beat');

// Set initial variables
let currentIndex = 0;
const step = container.offsetWidth / 4;

// Function to move container left or right by a specified number of pixels
function moveContainer(distance) {
  container.scrollLeft += distance;
}

// Event listener for left arrow click
document.querySelector('.arrow-left').addEventListener('click', () => {
  // Move container left by one step
  currentIndex--;
  moveContainer(-step);
  // Loop around to the end of the beats if we reach the beginning
  if (currentIndex < 0) {
    currentIndex = beats.length - 1;
    moveContainer(step * beats.length);
  }
});

// Event listener for right arrow click
document.querySelector('.arrow-right').addEventListener('click', () => {
  // Move container right by one step
  currentIndex++;
  moveContainer(step);
  // Loop around to the beginning of the beats if we reach the end
  if (currentIndex >= beats.length) {
    currentIndex = 0;
    moveContainer(-step * beats.length);
  }
});
