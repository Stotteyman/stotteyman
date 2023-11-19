document.addEventListener('DOMContentLoaded', function() {
    var content = document.getElementById('content');
    var navigationLinks = document.querySelectorAll('.navigation a');

    // Function to load content based on URL
    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                content.innerHTML = html;
            })
            .catch(error => console.error('Error:', error));
    }

    // Event listener for navigation clicks
    navigationLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            var url = this.getAttribute('href');
            loadContent(url);
        });
    });
});
