const logo = document.getElementById("logo");
const heroHeight = document.querySelector(".head-home").offsetHeight;

window.addEventListener("scroll", () => {
    let sc = window.scrollY;
    
    // scale from 1 → min 0.6
    let scale = 1 - (sc / (heroHeight * 1.5));

    if (scale < 0.6) scale = 0.6; // minimum size

    logo.style.transform = `scale(${scale})`;
});

