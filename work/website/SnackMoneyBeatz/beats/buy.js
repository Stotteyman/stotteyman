// get all buy buttons
const buyBtns = document.querySelectorAll('.buy-btn');

// add click event listener to each buy button
buyBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    // get the beat info element for the current beat
    const beatInfo = this.parentElement;
    
    // get the beat name and image for the current beat
    const beatName = beatInfo.querySelector('h3').textContent;
    const beatImg = beatInfo.parentElement.querySelector('.play-pause').src;
    
    // show the beat name and image in the popup
    const popup = document.querySelector('.popup');
    const popupImg = popup.querySelector('img');
    const popupName = popup.querySelector('h2');
    popupImg.src = beatImg;
    popupName.textContent = beatName;
    
    // open the buy link for the current beat
    const buyLink = this.dataset.buylink;
    if (buyLink) {
      window.open(buyLink, '_blank');
    }
  });
});
