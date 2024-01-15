document.addEventListener("DOMContentLoaded", function() {
    const navElement = document.querySelector('.HOME-CONTACT-SOCIALS');
    const pageLinks = [
      'home.html',
      'contact.html',
      'socials.html',
      'customize.html',
      'shop.html',
      'sales.html',
      'other.html'
    ];
  
    // Function to create a span with multiple spaces
    const createSpacesSpan = (numSpaces) => {
      const span = document.createElement('span');
      span.innerHTML = '&nbsp;'.repeat(numSpaces);
      return span;
    };
  
    // Create the reactive set of text
    const reactiveText = 'home&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; contact&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; socials&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; customize&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; shop&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sales&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;other';
  
    // Split the reactive text into individual words
    const words = reactiveText.split(/\s+/);
  
    // Iterate over each word
    words.forEach((word, index) => {
      // Create a new span element for each word or space
      const span = createSpacesSpan(index === 0 ? 0 : 6); // No space before the first word
      span.innerHTML += word;
  
      // Add event listeners to change the color on hover
      span.addEventListener('mouseover', function() {
        this.style.color = 'red';
      });
      span.addEventListener('mouseout', function() {
        this.style.color = '';
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
  