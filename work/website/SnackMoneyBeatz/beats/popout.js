// Get the popup and close button elements
const popup = document.querySelector('.popup');
const closeBtn = document.getElementById('close-btn');

// Get all the "Info" buttons
const infoBtns = document.querySelectorAll('.buy-btn');

// Function to show the popup
function showPopup() {
  popup.style.display = 'block';
}

// Function to hide the popup
function hidePopup() {
  popup.style.display = 'none';
}

// Add click event listeners to all "Info" buttons
infoBtns.forEach((btn) => {
  btn.addEventListener('click', showPopup);
});

// Add click event listener to the close button
closeBtn.addEventListener('click', hidePopup);

// Hide the popup when the user clicks anywhere outside of it
window.addEventListener('click', (e) => {
  if (e.target === popup) {
    hidePopup();
  }
});
