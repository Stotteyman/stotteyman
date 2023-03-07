// Get all the play-pause buttons
const playPauseButtons = document.querySelectorAll('.play-pause');

// Keep track of the currently playing audio element
let currentAudio = null;

// Loop through all the play-pause buttons and add a click event listener to each
playPauseButtons.forEach(button => {
  button.addEventListener('click', () => {
    const audioSrc = button.getAttribute('data-audio');
    const audioPlayer = document.getElementById('audio-player');
    
    // If the current audio element is playing and the clicked button is for the same audio file,
    // pause the audio element and set the current audio element to null
    if (currentAudio && currentAudio.getAttribute('src') === audioSrc) {
      audioPlayer.pause();
      currentAudio = null;
      button.classList.toggle('playing');
      return;
    }

    // Pause the current audio element if there is one
    if (currentAudio) {
      audioPlayer.pause();
      currentAudio.classList.toggle('playing');
    }

    // Set the audio source and play the audio
    audioPlayer.setAttribute('src', audioSrc);
    audioPlayer.play();

    // Set the current audio element and add the playing class to the button
    currentAudio = audioPlayer;
    button.classList.toggle('playing');
  });
});

// Listen for the audio element to end and remove the playing class from the button
document.getElementById('audio-player').addEventListener('ended', () => {
  playPauseButtons.forEach(button => {
    button.classList.remove('playing');
  });
  currentAudio = null;
});
