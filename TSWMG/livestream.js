document.addEventListener("DOMContentLoaded", function () {
    const liveLink = document.getElementById('live-link');
    const livestreamContainer = document.getElementById('livestream-container');
    const socialMedia = document.getElementById('social-media');

    // Event listener for the "Live" link
    liveLink.addEventListener('click', function () {
        // Show livestream container
        livestreamContainer.style.display = 'block';
        // Hide social media links
        socialMedia.style.display = 'none';
        // Set the livestream URL
        document.getElementById('livestream-frame').src = 'https://kick.com/inslimewetrustlive';
        // Highlight the "Live" link and remove highlights from other links
        liveLink.classList.add('selected');
        document.getElementById('about-link').classList.remove('selected');
        document.getElementById('contact-link').classList.remove('selected');
    });

    // Function to hide the livestream container
    function hideLivestream() {
        livestreamContainer.style.display = 'none';
        // Pause the livestream when hiding
        document.getElementById('livestream-frame').src = '';
    }

    // Event listener for hiding livestream on other link clicks
    document.addEventListener('click', function (event) {
        const clickedElement = event.target;
        if (!clickedElement.closest('#livestream-container') && !clickedElement.closest('#live-link')) {
            hideLivestream();
        }
    });
});
