(() => {
  const headerMarkup = `
    <header class="site-header">
      <div class="logo-container">
        <a href="index.html" class="logo-link" aria-label="Tu Marca Personal, inicio">
          <img src="codigo/img/logos/logo_tmp.png" alt="Tu Marca Personal" title="Tu Marca Personal" class="logo-img">
        </a>
      </div>
      <button class="menu-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false" aria-label="Abrir menú">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
      <nav id="primary-navigation" class="nav-links" aria-label="Navegación principal">
        <a href="index.html" class="nav-item"><span class="nav-text" data-hover="Inicio">Inicio</span></a>
        <a href="catalogo.html" class="nav-item"><span class="nav-text" data-hover="Catálogo">Catálogo</span></a>
        <a href="novedades.html" class="nav-item"><span class="nav-text" data-hover="Novedades">Novedades</span></a>
        <a href="ayuda.html" class="nav-item"><span class="nav-text" data-hover="Ayuda">Ayuda</span></a>
      </nav>
      <span class="header-cta-glow-wrapper">
        <a href="https://api.whatsapp.com/send/?phone=5215611265205" target="_blank" rel="noopener noreferrer" class="header-cta" aria-label="Contactar por WhatsApp">
          <span class="cta-shimmer" aria-hidden="true"></span>
          <span class="cta-text">Contacto Rápido</span>
        </a>
      </span>
    </header>`;

  const footerMarkup = `
    <footer class="site-footer">
      <div class="footer-wrapper">
        <div class="footer-side footer-left">
          <div class="footer-col">
            <h3>Navegación</h3>
            <ul>
              <li><a href="index.html#inicio">Inicio</a></li>
              <li><a href="catalogo.html#catalogo">Catálogo General</a></li>
              <li><a href="catalogo.html#sudaderas">Sudaderas NFL</a></li>
              <li><a href="catalogo.html#soccer">Playeras de Soccer</a></li>
              <li><a href="novedades.html#novedades">Novedades</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3>Nuestra Marca</h3>
            <p class="footer-slogan">“Tú dejas tu marca, nosotros nos encargamos de la prenda.”</p>
            <p class="footer-desc">Manufactura 100% mexicana de alta resistencia.</p>
          </div>
        </div>
        <div class="footer-center-logo">
          <a id="footer-shield" href="#top" aria-label="Volver al inicio">
            <img src="codigo/img/logos/logo_tmp.png" alt="Escudo Tu Marca Personal">
          </a>
        </div>
        <div class="footer-side footer-right">
          <div class="footer-col">
            <h3>Ayuda y Confianza</h3>
            <ul>
              <li><a href="ayuda.html#faq">Preguntas Frecuentes</a></li>
              <li><a href="ayuda.html#cambios">Cambios y Devoluciones</a></li>
              <li><a href="terminos.html#terminos">Términos y Condiciones</a></li>
              <li><a href="privacidad.html#privacidad">Aviso de Privacidad</a></li>
              <li><a href="cookis.html#cookies">Cookies</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3>Atención Directa</h3>
            <p class="footer-schedule">
              <strong>Mensajes:</strong> 7:00 a.m. – 10:00 p.m.<br>
              <strong>Llamadas:</strong> 10:00 a.m. – 6:00 p.m.
            </p>
            <div class="header-cta-glow-wrapper">
              <a href="https://api.whatsapp.com/send/?phone=5215611265205" class="header-cta" target="_blank" rel="noopener noreferrer">WhatsApp / Contacto</a>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="current-year"></span> Tu Marca Personal. Todos los derechos reservados.</p>
      </div>
    </footer>`;

  const floatingButtonsMarkup = `
    <nav class="button-stack" aria-label="Redes sociales">
      <div class="btn-wrapper">
        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" class="orb-btn btn-tiktok" aria-label="TikTok">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.5z"></path></svg>
        </a>
        <span class="btn-label">TikTok</span>
      </div>
      <div class="btn-wrapper">
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" class="orb-btn btn-instagram" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
        <span class="btn-label">Instagram</span>
      </div>
      <div class="btn-wrapper">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" class="orb-btn btn-facebook" aria-label="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        </a>
        <span class="btn-label">Facebook</span>
      </div>
    </nav>`;

  function mountSiteShell() {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    const floatingButtons = document.getElementById('site-floating-buttons');

    if (header && !header.hasChildNodes()) header.innerHTML = headerMarkup;
    if (footer && !footer.hasChildNodes()) footer.innerHTML = footerMarkup;
    if (floatingButtons && !floatingButtons.hasChildNodes()) {
      floatingButtons.innerHTML = floatingButtonsMarkup;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSiteShell, { once: true });
  } else {
    mountSiteShell();
  }
})();
