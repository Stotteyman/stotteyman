document.addEventListener('DOMContentLoaded', function() {
    // Load header content
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('header').innerHTML = html;
        })
        .catch(error => console.error('Error:', error));

    // Function to load content based on URL
    function loadContent(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => {
                document.getElementById('content').innerHTML = html;
            })
            .catch(error => console.error('Error:', error));
    }

    // Event listener for navigation clicks
    document.querySelectorAll('.navigation a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            var url = this.getAttribute('href');
            loadContent(url);
        });
    });
});
