// script.js
document.addEventListener('DOMContentLoaded', () => {
    const drawbridge = document.getElementById('drawbridge');
    const interiorText = document.getElementById('interior-text');
    let isOpen = false;

    drawbridge.addEventListener('click', () => {
        // Empêche de recliquer pendant l'animation
        if (isOpen) return;
        isOpen = true;

        // Ajoute les classes pour démarrer les animations CSS
        drawbridge.classList.add('open');
        interiorText.classList.add('visible');

        // Vous pouvez ajouter un son si vous le souhaitez
        // const audio = new Audio('path/to/drawbridge-sound.mp3');
        // audio.play();
    });
});