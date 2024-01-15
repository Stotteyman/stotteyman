document.addEventListener("DOMContentLoaded", function() {
    const navElement = document.querySelector('.HOME-CONTACT-SOCIALS');
    const pageLinks = [
      'home.html',
      'contact.html',
      'socials.html',
      'customize.html',
      'shop.html',
      'sales.html'
    ];
  
    // Function to create a span with multiple spaces
    const createSpacesSpan = (numSpaces) => {
      const span = document.createElement('span');
      span.innerHTML = '&nbsp;'.repeat(numSpaces);
      return span;
    };
  
    // Iterate over each page link
    pageLinks.forEach((link, index) => {
      // Skip empty links
      if (link.trim() !== '') {
        // Create a new span element for each word or space
        const span = createSpacesSpan(index === 0 ? 0 : 6); // No space before the first word
        span.innerHTML += link.split('.')[0]; // Extract the word from the link
  
        // Add event listeners to change the color on hover
        span.addEventListener('mouseover', function() {
          this.style.color = 'red';
        });
        span.addEventListener('mouseout', function() {
          this.style.color = '';
        });
  
        // Add click event listener to redirect to the corresponding page
        span.addEventListener('click', function() {
          window.location.href = link;
        });
  
        // Append the span element to the navigation element
        navElement.appendChild(span);
  
        // Add an additional space after each word (except the last one)
        if (index < pageLinks.length - 1) {
          navElement.appendChild(createSpacesSpan(6));
        }
      }
    });
  });
  