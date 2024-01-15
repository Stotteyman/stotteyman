document.addEventListener("DOMContentLoaded", function() {
    // Select the element containing the navigation words
    const navElement = document.querySelector('.HOME-CONTACT-SOCIALS');
  
    // Split the text content into individual words
    const words = navElement.innerText.trim().split(/\s+/);
  
    // Clear the original text content
    navElement.innerHTML = '';
  
    // Array of links corresponding to each menu item
    const pageLinks = [
      'home.html',       // Replace with your home page link
      'contact.html',    // Replace with your contact page link
      'socials.html',    // Replace with your socials page link
      'customize.html',  // Replace with your customize page link
      'shop.html',       // Replace with your shop page link
      'sales.html'       // Replace with your sales page link
    ];
  
    // Function to create a span with multiple spaces
    const createSpacesSpan = (numSpaces) => {
      const span = document.createElement('span');
      span.innerHTML = '&nbsp;'.repeat(numSpaces);
      return span;
    };
  
    // Iterate over each word
    words.forEach((word, index) => {
      // Create a new span element for each word or space
      const span = createSpacesSpan(index === 0 ? 0 : 6); // No space before the first word
      span.innerHTML += word;
  
      // Add event listeners to change the color on hover
      span.addEventListener('mouseover', function() {
        this.style.color = 'red'; // Change this to the highlight color you want
      });
      span.addEventListener('mouseout', function() {
        this.style.color = ''; // Resets the color when not hovering
      });
  
      // Add click event listener to redirect to the corresponding page
      span.addEventListener('click', function() {
        window.location.href = pageLinks[index];
      });
  
      // Append the span element to the navigation element
      navElement.appendChild(span);
  
      // Add an additional space after each word (except the last one)
      if (index < words.length - 1) {
        navElement.appendChild(createSpacesSpan(6));
      }
    });
  });
  