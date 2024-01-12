document.addEventListener("DOMContentLoaded", function () {
    const liveLink = document.getElementById('live-link');
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');

    // Event listeners for the navigation links
    liveLink.addEventListener('click', showLiveContent);
    aboutLink.addEventListener('click', showAboutContent);
    contactLink.addEventListener('click', showContactContent);

    // Function to show the live content
    function showLiveContent() {
        hideAllContent();
        document.getElementById('live-content').style.display = 'block';
    }

    // Function to show the about content
    function showAboutContent() {
        hideAllContent();
        document.getElementById('about-content').style.display = 'block';
    }

    // Function to show the contact content
    function showContactContent() {
        hideAllContent();
        document.getElementById('contact-content').style.display = 'block';
    }

    // Function to hide all content sections
    function hideAllContent() {
        document.getElementById('live-content').style.display = 'none';
        document.getElementById('about-content').style.display = 'none';
        document.getElementById('contact-content').style.display = 'none';
    }

    // By default, show the about content
    showAboutContent();
});
