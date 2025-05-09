
document.addEventListener('DOMContentLoaded', () => {
  const landing = document.getElementById('landing');
  const home = document.getElementById('home');

  // Landing page tap to continue
  landing.addEventListener('click', () => {
    landing.classList.remove('active');
    home.classList.add('active');
  });

  // Handle navigation for app icons
  document.querySelectorAll('.app-icon[data-section]').forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = icon.getAttribute('data-section');
      const section = document.getElementById(sectionId);
      
      // Add loading animation
      icon.classList.add('loading');
      
      // Simulate loading delay
      setTimeout(() => {
        icon.classList.remove('loading');
        home.classList.remove('active');
        section.classList.add('active');
      }, 800); // 800ms delay for loading effect
    });
  });

  // Handle back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentScreen = btn.closest('.screen');
      currentScreen.classList.remove('active');
      home.classList.add('active');
    });
  });

  // Phone app navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const screenId = btn.getAttribute('data-screen');
      
      // Update active nav button
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show selected screen
      document.querySelectorAll('.phone-screen').forEach(screen => {
        screen.classList.remove('active');
      });
      document.getElementById(`${screenId}-screen`).classList.add('active');
    });
  });

  // Handle contact form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const [name, email, message] = e.target.elements;
      window.location.href = `mailto:contact@stotteyman.com?subject=Contact from ${name.value}&body=${message.value}%0A%0AFrom: ${email.value}`;
      e.target.reset();
    });
  }

  // Contact details data
  const contactData = {
    banjoe: {
      fullName: "Banjoe",
      role: "Music Producer",
      bio: "Innovative music producer specializing in electronic beats",
      links: ["https://soundcloud.com/banjoe"]
    },
    williekush: {
      fullName: "Willie Kush",
      role: "Artist",
      bio: "Creative artist known for unique style and vision",
      links: ["https://instagram.com/williekush"]
    },
    deanza: {
      fullName: "Deanza",
      role: "Producer",
      bio: "Experienced producer with a passion for hip-hop",
      links: ["https://soundcloud.com/deanza"]
    },
    snackmoneybeatz: {
      fullName: "SnackMoneyBeatz",
      role: "Beat Producer",
      bio: "Creating unique beats and rhythms",
      links: ["https://soundcloud.com/snackmoneybeatz"]
    },
    newz: {
      fullName: "Newz",
      role: "Artist",
      bio: "Up-and-coming artist with fresh perspective",
      links: ["https://instagram.com/newz"]
    },
    bobby: {
      fullName: "Bobby",
      role: "Producer",
      bio: "Versatile producer working across genres",
      links: ["https://soundcloud.com/bobby"]
    },
    bahbah: {
      fullName: "BahBah",
      role: "Artist",
      bio: "Innovative artist pushing boundaries",
      links: ["https://instagram.com/bahbah"]
    }
  };

  // Handle contact clicks
  document.querySelectorAll('.contact-entry').forEach(contact => {
    contact.addEventListener('click', () => {
      const contactId = contact.getAttribute('data-contact');
      const details = document.querySelector('.contact-details');
      const content = document.querySelector('.details-content');
      
      if (contactData[contactId]) {
        const data = contactData[contactId];
        content.innerHTML = `
          <h3>${data.fullName}</h3>
          <p><strong>Role:</strong> ${data.role}</p>
          <p>${data.bio}</p>
          ${data.links ? `<p><strong>Links:</strong> ${data.links.map(link => 
            `<a href="${link}" target="_blank">${link.split('/').pop()}</a>`).join(', ')}</p>` : ''}
        `;
      } else {
        content.innerHTML = `
          <h3>${contact.querySelector('.contact-name').textContent}</h3>
          <p>Placeholder contact information</p>
        `;
      }
      
      details.style.display = 'block';
    });
  });

  // Handle close details button
  document.querySelector('.close-details')?.addEventListener('click', () => {
    document.querySelector('.contact-details').style.display = 'none';
  });
});
