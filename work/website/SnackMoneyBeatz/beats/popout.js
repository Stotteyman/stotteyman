// Get the popup and close button elements
const popup = document.querySelector('.popup');
const closeBtn = document.querySelector('#close-btn');

// Get the popup media elements
const popupImg = document.querySelector('.popup-play-pause');
const popupAudio = document.querySelector('#audio-player');

// Get the popup info and buy now button elements
const popupInfo = document.querySelector('.popup-beat-info');
const popupBuyBtn = document.querySelector('.popup-buy-info .buy-btn');

// Add click event listeners to all info buttons
const infoBtns = document.querySelectorAll('.beat-info .buy-btn');
infoBtns.forEach(function(infoBtn) {
  infoBtn.addEventListener('click', function() {
    // Get the beat info elements for the clicked button
    const beat = infoBtn.closest('.beat');
    const beatImg = beat.querySelector('.play-pause');
    const beatAudioSrc = beatImg.getAttribute('data-audio');
    const beatTitle = beat.querySelector('h3').textContent;

    // Update the popup media and info elements with the clicked beat info
    popupImg.setAttribute('src', beatImg.getAttribute('src'));
    popupAudio.setAttribute('src', beatAudioSrc);
    popupInfo.querySelector('h3').textContent = beatTitle;

    // Show the popup
    popup.style.display = 'block';
  });
});

// Add click event listener to close button
closeBtn.addEventListener('click', function() {
  // Pause the audio and hide the popup
  popupAudio.pause();
  popup.style.display = 'none';
});

// Add click event listener to buy now button
popupBuyBtn.addEventListener('click', function() {
  // Redirect to snackmoneybeatz.page.link/(beat name)
  const beatTitle = popupInfo.querySelector('h3').textContent;
  window.location.href = `https://snackmoneybeatz.page.link/${beatTitle}`;
});
