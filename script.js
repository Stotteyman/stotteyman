const sections = document.querySelectorAll('.section');
let currentSection = 0;

document.addEventListener('wheel', (e) => {
    if (e.deltaY > 0 && currentSection < sections.length - 1) {
        currentSection++;
    } else if (e.deltaY < 0 && currentSection > 0) {
        currentSection--;
    }
    scrollToSection(currentSection);
});

function scrollToSection(index) {
    sections.forEach((section, i) => {
        section.style.transform = `translateY(${100 * (i - index)}vh)`;
    });
}
