document.addEventListener("DOMContentLoaded", function() {
  const navElement = document.querySelector('.HOME-CONTACT-SOCIALS');
  const pageLinks = [
    '/bch',
    '/bch',
    '/bch',
    '/bch',
    '/bch',
    '/bch',
    '/bch'
  ];

  // Function to create a span with multiple spaces
  const createSpacesSpan = (numSpaces) => {
    const span = document.createElement('span');
    span.innerHTML = '&nbsp;'.repeat(numSpaces);
    return span;
  };

  // Create the reactive set of text
  const reactiveText = 'home contact socials customize shop sales other';

  // Clear the original text content
  navElement.innerHTML = '';

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
    navElement.appendChild(span)
  });
});
