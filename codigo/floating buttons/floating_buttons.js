/* ==========================================
   LÓGICA E INTERACTIVIDAD DE LOS BOTONES
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const orbButtons = document.querySelectorAll('.orb-btn');

    orbButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const networkName = button.getAttribute('aria-label');
            console.log(`Usuario hizo clic en el acceso directo de: ${networkName}`);
        });
    });
});