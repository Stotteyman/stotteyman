// JavaScript
document.addEventListener("DOMContentLoaded", function() {
    // Select the element containing the navigation words
    const navElement = document.querySelector('.HOME-CONTACT-SOCIALS');

    // Split the text content into individual words
    const words = navElement.textContent.split(/\s+/);

    // Clear the original text content
    navElement.textContent = '';

    // Iterate over each word
    words.forEach(word => {
        // Create a new span element for each word
        const span = document.createElement('span');
        span.textContent = word;

        // Add event listeners to change the color on hover
        span.addEventListener('mouseover', function() {
            this.style.color = 'red'; // Change this to the highlight color you want
        });
        span.addEventListener('mouseout', function() {
            this.style.color = ''; // Resets the color when not hovering
        });

        // Append the span element to the navigation element
        navElement.appendChild(span);

        // Add a space after each word for proper spacing
        navElement.appendChild(document.createTextNode(' '));
    });
});