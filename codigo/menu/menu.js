document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = menuToggle
        ? document.getElementById(menuToggle.getAttribute('aria-controls'))
        : null;

    const setMenuOpen = (isOpen) => {
        if (!menuToggle || !navigation) return;

        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        navigation.classList.toggle('is-open', isOpen);
    };

    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
        });

        document.addEventListener('click', (event) => {
            if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
                setMenuOpen(false);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false);
                menuToggle.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) setMenuOpen(false);
        });
    }

    const normalizePath = (path) => path.endsWith('/') ? `${path}index.html` : path;
    const currentPath = normalizePath(window.location.pathname);

    navItems.forEach((item) => {
        const targetPath = normalizePath(new URL(item.href, window.location.href).pathname);
        const isActive = targetPath === currentPath;

        item.classList.toggle('active', isActive);
        if (isActive) {
            item.setAttribute('aria-current', 'page');
        } else {
            item.removeAttribute('aria-current');
        }

        item.addEventListener('click', () => {
            navItems.forEach((nav) => {
                nav.classList.remove('active');
                nav.removeAttribute('aria-current');
            });

            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
            setMenuOpen(false);
        });
    });
});
