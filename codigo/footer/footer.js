/* ==========================================
   LÓGICA DEL FOOTER
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Actualiza el año del copyright automáticamente
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Al activar el escudo central, sube suavemente al inicio de la página
    const shieldLink = document.getElementById('footer-shield');
    if (shieldLink) {
        shieldLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
