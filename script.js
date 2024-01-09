document.addEventListener('DOMContentLoaded', function() {
    // Get all the grid items
    const gridItems = document.querySelectorAll('.grid-item');

    // Loop through each grid item and attach a click event listener
    gridItems.forEach(function(item) {
        item.addEventListener('click', function() {
            // Redirect to the corresponding page based on the clicked item
            if (item.querySelector('img').alt === 'W.A.G.E. Society') {
                window.location.href = 'https://wagesociety.com'; // Link to W.A.G.E. Society
            } else if (item.querySelector('img').alt === 'Coming Soon') {
                // Add the link for the second project if available
                window.location.href = 'https://example.com'; // Example link
            }
            // Add more conditions for other projects if needed
        });
    });
});
