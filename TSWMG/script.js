document.addEventListener("DOMContentLoaded", function () {
    const livestreamContainer = document.getElementById('livestream-container');
    const livestreamFrame = document.getElementById('livestream-frame');
    const liveLink = document.getElementById('live-link');

    // Event listener for the "Live" link
    liveLink.addEventListener('click', function () {
        // Show livestream container
        livestreamContainer.style.display = 'block';
        // Set the livestream URL
        livestreamFrame.src = 'https://kick.com/inslimewetrustlive';
    });

    // Function to hide the livestream container
    function hideLivestream() {
        livestreamContainer.style.display = 'none';
        // Pause the livestream when hiding
        livestreamFrame.src = '';
    }

    // Event listener for hiding livestream on other link clicks
    document.addEventListener('click', function (event) {
        const clickedElement = event.target;
        if (!clickedElement.closest('#livestream-container') && !clickedElement.closest('#live-link')) {
            hideLivestream();
        }
    });
});
