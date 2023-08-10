const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    if (body.classList.contains('light-theme')) {
        themeToggle.innerHTML = '<img src="light-icon.png" alt="Light Mode">';
    } else {
        themeToggle.innerHTML = '<img src="dark-icon.png" alt="Dark Mode">';
    }
});
