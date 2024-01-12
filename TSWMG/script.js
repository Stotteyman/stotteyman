document.addEventListener("DOMContentLoaded", function () {
    const liveLink = document.getElementById('live-link');
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');

    // Event listeners for the navigation links
    liveLink.addEventListener('click', showLiveContent);
    aboutLink.addEventListener('click', showAboutContent);
    contactLink.addEventListener('click', showContactContent);

    // Function to show the livestream content
    function showLiveContent() {
        hideAllContent();
        document.getElementById('livestream-container').style.display = 'block';
        // Add logic to check if the livestream is live using the provided API and display accordingly
        // (Auto play, volume, chat integration when live, and offline screen when offline)
    }

    // Function to show the about content
    function showAboutContent() {
        hideAllContent();
        document.getElementById('about-content').style.display = 'block';
        // Add your content for the about section (pictures, videos, etc.)
    }

    // Function to show the contact content
    function showContactContent() {
        hideAllContent();
        // Add your contact content here
    }

    // Function to hide all content sections
    function hideAllContent() {
        document.getElementById('livestream-container').style.display = 'none';
        document.getElementById('about-content').style.display = 'none';
        // Add more if needed for other sections
    }

    // By default, show the about content and highlight the "About" link
    showAboutContent();
    aboutLink.classList.add('selected');
});
