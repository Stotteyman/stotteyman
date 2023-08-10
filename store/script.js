const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    if (body.classList.contains('light-theme')) {
        themeToggle.innerHTML = '<span>Light Mode</span> / <span>Dark Mode</span>';
    } else {
        themeToggle.innerHTML = '<span>Dark Mode</span> / <span>Light Mode</span>';
    }
});
