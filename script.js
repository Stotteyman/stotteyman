
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.carousel');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  const projectBoxes = document.querySelectorAll('.project-box');
  
  let currentPosition = 0;
  const boxWidth = 220; // box width + gap
  const maxPosition = -(projectBoxes.length - 1) * boxWidth;
  
  function updateCarousel() {
    carousel.style.transform = `translateX(${currentPosition}px)`;
  }
  
  prevBtn.addEventListener('click', () => {
    currentPosition = Math.min(currentPosition + boxWidth, 0);
    updateCarousel();
  });
  
  nextBtn.addEventListener('click', () => {
    currentPosition = Math.max(currentPosition - boxWidth, maxPosition);
    updateCarousel();
  });
  
  // Make project boxes clickable for future content
  projectBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const projectNumber = box.textContent.split('#')[1];
      // Add your click handling logic here
      console.log(`Project ${projectNumber} clicked`);
    });
  });
});
