document.addEventListener('DOMContentLoaded', function() {
    // Get all the grid items
    const gridItems = document.querySelectorAll('.grid-item');

    // Loop through each grid item and attach a click event listener
    gridItems.forEach(function(item) {
        item.addEventListener('click', function() {
            // Open the corresponding page in a new tab based on the clicked item
            if (item.querySelector('img').alt === 'W.A.G.E. Society') {
                window.open('https://wagesociety.com', '_blank'); // Link to W.A.G.E. Society
            } else if (item.querySelector('img').alt === 'Coming Soon') {
                // Add the link for the second project if available
                window.open('/'); // Example link
            }
            // Add more conditions for other projects if needed
        });
    });
});
