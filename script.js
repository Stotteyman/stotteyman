document.addEventListener('DOMContentLoaded', function() {
    var links = document.querySelectorAll('a');

    links.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default behavior of the links
            // Your custom logic here
        });
    });
});
