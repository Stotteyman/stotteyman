document.addEventListener('DOMContentLoaded', function() {
    const content = document.getElementById('content');

    // Function to create an entrance animation
    function animateEntrance() {
        content.style.opacity = '0'; // Initially hide the content

        // Add entrance animation here (e.g., fade in)
        content.style.transition = 'opacity 1s ease-in-out';
        setTimeout(() => {
            content.style.opacity = '1';
        }, 1000); // 1000 milliseconds delay
    }

    // Function to load livestream on button click
    function loadLivestream() {
        window.open('https://www.youtube.com/stotteyman', '_blank');
    }

    // Create "Watch Live" button
    function createWatchLiveButton() {
        const watchLiveButton = document.createElement('button');
        watchLiveButton.textContent = 'Watch Live';
        watchLiveButton.classList.add('watch-live-btn');
        watchLiveButton.addEventListener('click', loadLivestream);
        content.appendChild(watchLiveButton);
    }

    // Animate entrance and create "Watch Live" button
    animateEntrance();
    createWatchLiveButton();
});
