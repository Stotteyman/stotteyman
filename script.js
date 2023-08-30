const sections = document.querySelectorAll('.section');
const container = document.querySelector('.sections');
let currentSection = 0;

document.addEventListener('wheel', (e) => {
    if (e.deltaY > 0 && currentSection < sections.length - 1) {
        currentSection++;
    } else if (e.deltaY < 0 && currentSection > 0) {
        currentSection--;
    }
    scrollToSection(currentSection);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
        currentSection++;
    } else if (e.key === 'ArrowUp' && currentSection > 0) {
        currentSection--;
    }
    scrollToSection(currentSection);
});

let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    const touchEndY = e.touches[0].clientY;
    if (touchEndY - touchStartY > 50 && currentSection > 0) {
        currentSection--;
        scrollToSection(currentSection);
    } else if (touchStartY - touchEndY > 50 && currentSection < sections.length - 1) {
        currentSection++;
        scrollToSection(currentSection);
    }
});

function scrollToSection(index) {
    sections.forEach((section, i) => {
        section.style.transform = `translateY(-${100 * (index - i)}vh)`;
    });
}
