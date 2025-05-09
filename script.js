document.addEventListener('DOMContentLoaded', () => {
  const landing = document.getElementById('landing');
  const home = document.getElementById('home');

  // Add clock to first app grid
  const clock = document.createElement('div');
  clock.className = 'clock app-icon';
  const firstGrid = document.querySelector('.app-grid');
  firstGrid.insertBefore(clock, firstGrid.firstChild);

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  updateClock();
  setInterval(updateClock, 1000);

  let touchStartX = 0;
  let touchEndX = 0;
  let currentPage = 0;
  const MIN_SWIPE_DISTANCE = 50;

  // Touch events
  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  });

  document.addEventListener('touchmove', e => {
    touchEndX = e.touches[0].clientX;
  });

  document.addEventListener('touchend', () => {
    const swipeDistance = touchStartX - touchEndX;
    if (Math.abs(swipeDistance) > MIN_SWIPE_DISTANCE) {
      if (swipeDistance > 0 && currentPage < appGrids.length - 1) {
        switchPage(currentPage + 1);
      } else if (swipeDistance < 0 && currentPage > 0) {
        switchPage(currentPage - 1);
      }
    }
  });

  // Keyboard controls
  document.addEventListener('keydown', e => {
    if (home.classList.contains('active')) {
      if (e.key === 'ArrowRight' && currentPage < appGrids.length - 1) {
        switchPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' && currentPage > 0) {
        switchPage(currentPage - 1);
      }
    }
  });

  // Mouse drag
  let isDragging = false;
  let startX = 0;

  document.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const swipeDistance = startX - e.clientX;
    const threshold = window.innerWidth / 4;

    if (Math.abs(swipeDistance) > threshold) {
      isDragging = false;
      if (swipeDistance > 0 && currentPage < appGrids.length - 1) {
        switchPage(currentPage + 1);
      } else if (swipeDistance < 0 && currentPage > 0) {
        switchPage(currentPage - 1);
      }
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Setup pagination
  const appGrids = document.querySelectorAll('.app-grid');
  const paginationDots = document.querySelector('.pagination-dots');

  appGrids.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => switchPage(index));
    paginationDots.appendChild(dot);
  });

  function switchPage(pageIndex) {
    if (pageIndex === currentPage) return;

    const direction = pageIndex > currentPage ? 1 : -1;
    const currentGrid = appGrids[currentPage];
    const nextGrid = appGrids[pageIndex];

    if (!currentGrid || !nextGrid) return;

    // Reset all grids
    appGrids.forEach(grid => {
      if (grid) {
        grid.style.transform = '';
        grid.style.opacity = '0';
        grid.style.zIndex = '0';
        grid.classList.remove('active');
      }
    });

    // Position the next grid
    nextGrid.style.transform = `translateX(${direction * 100}%)`;
    nextGrid.style.opacity = '1';
    nextGrid.style.zIndex = '2';
    nextGrid.classList.add('active');
    
    currentGrid.style.opacity = '1';
    currentGrid.style.zIndex = '1';
    currentGrid.classList.remove('active');

    // Trigger animation
    requestAnimationFrame(() => {
      nextGrid.style.transform = 'translateX(0)';
      currentGrid.style.transform = `translateX(${-direction * 100}%)`;

      document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === pageIndex);
      });
    });

    currentPage = pageIndex;
  }

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

        // If contacts icon was clicked, switch to contacts tab in phone app
        if (sectionId === 'favorites' || sectionId === 'recents' || sectionId === 'phone' || sectionId === 'voicemail') {
          section.classList.add('active');
          const screenTitle = section.querySelector('.screen-header h2');
          if (screenTitle) {
            screenTitle.textContent = icon.querySelector('span').textContent;
          }
        }
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
    saiman: {
      fullName: "Saiman",
      role: "Content Creator",
      bio: "Creative Twitch streamer and content creator",
      links: ["https://www.twitch.tv/itsmesaiman"]
    },
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