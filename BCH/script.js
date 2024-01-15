// JavaScript
document.addEventListener("DOMContentLoaded", function() {
    // Select the element containing the navigation words
    const navElement = document.querySelector('.HOME-CONTACT-SOCIALS');

    // Split the text content into individual words and spaces
    const words = navElement.innerHTML.split(/(&nbsp;)+|(\s)+/);

    // Clear the original text content
    navElement.innerHTML = '';

    // Iterate over each word
    words.forEach(word => {
        // Create a new span element for each word or space
        const span = document.createElement('span');
        span.innerHTML = word;

        // If the word is not a space, add event listeners to change the color on hover
        if (word.trim() !== '') {
            span.addEventListener('mouseover', function() {
                this.style.color = 'red'; // Change this to the highlight color you want
            });
            span.addEventListener('mouseout', function() {
                this.style.color = ''; // Resets the color when not hovering
            });
        }

        // Append the span element to the navigation element
        navElement.appendChild(span);
    });
});