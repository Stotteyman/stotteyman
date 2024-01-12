document.addEventListener("DOMContentLoaded", function () {
    const liveLink = document.getElementById('live-link');
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');
    const livestreamContainer = document.getElementById('livestream-container');
    const socialMedia = document.getElementById('social-media');

    // Event listeners for the navigation links
    liveLink.addEventListener('click', function () {
        showContent('live');
    });

    aboutLink.addEventListener('click', function () {
        showContent('about');
        // Show social media links on the "About" page
        socialMedia.style.display = 'block';
    });

    contactLink.addEventListener('click', function () {
        // Navigate to the Discord link when "Contact" is clicked
        window.location.href = 'https://discord.gg/gFQkHSQQkC';
    });

    // Function to show the selected content
    function showContent(contentType) {
        hideAllContent();
        if (contentType === 'live') {
            livestreamContainer.style.display = 'block';
        } else if (contentType === 'about') {
            document.getElementById('about-content').style.display = 'block';
        }
        // Add more conditions if needed for other content types
    }

    // Function to hide all content sections
    function hideAllContent() {
        livestreamContainer.style.display = 'none';
        document.getElementById('about-content').style.display = 'none';
        // Add more if needed for other sections
    }

    // By default, show the "About" content and highlight the "About" link
    showContent('about');
    aboutLink.classList.add('selected');
});
