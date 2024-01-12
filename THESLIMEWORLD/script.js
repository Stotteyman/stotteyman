document.addEventListener("DOMContentLoaded", function () {
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');
    const socialMedia = document.getElementById('social-media');

    // Event listeners for the navigation links
    aboutLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior
        showContent('about');
        // Show social media links on the "About" page
        socialMedia.style.display = 'block';
    });

    contactLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior
        // Navigate to the Discord link when "Contact" is clicked
        window.location.href = 'https://discord.gg/gFQkHSQQkC';
    });

    // Function to show the selected content
    function showContent(contentType) {
        hideAllContent();
        if (contentType === 'about') {
            document.getElementById('about-content').style.display = 'block';
            // Highlight the "About" link and remove highlights from other links
            aboutLink.classList.add('selected');
            document.getElementById('live-link').classList.remove('selected');
            document.getElementById('contact-link').classList.remove('selected');
        }
        // Add more conditions if needed for other content types
    }

    // Function to hide all content sections
    function hideAllContent() {
        document.getElementById('livestream-container').style.display = 'none';
        document.getElementById('about-content').style.display = 'none';
        // Add more if needed for other sections
    }

    // By default, show the "Live" content and highlight the "Live" link
    showContent('live');
});
