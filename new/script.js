document.addEventListener('DOMContentLoaded', function () {
    // Get all projects cards
    const projectCards = document.querySelectorAll('.projects-card1');

    // Define click event handler
    const handleClick = function (url) {
      window.open(url, '_blank'); // Open the URL in a new tab
    };

    // Attach click event to each project card
    projectCards.forEach(function (card) {
      const image = card.querySelector('.projects-image2');
      const url = card.getAttribute('data-url');

      // Check if URL is available
      if (url) {
        // Add click event to open the URL
        image.addEventListener('click', function () {
          handleClick(url);
        });
      }
    });
  });