document.addEventListener('DOMContentLoaded', function() {
    const gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach(function(item) {
        item.addEventListener('click', function() {
            // Open the corresponding page in a new tab based on the clicked item
            const link = item.getAttribute('data-link');
            if (link) {
                window.open(link, '_blank');
            }
        });
    });
});
