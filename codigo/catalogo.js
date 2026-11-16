(() => {
  const filterForm = document.getElementById('catalog-filters');
  const filterPanel = document.getElementById('filter-panel');
  const productGrid = document.getElementById('product-grid');
  const resultsCount = document.getElementById('results-count');
  const emptyResults = document.getElementById('empty-results');

  if (!filterForm || !productGrid) return;

  const cards = Array.from(productGrid.querySelectorAll('[data-product-card]'));
  const search = document.getElementById('filter-search');
  const category = document.getElementById('filter-category');
  const size = document.getElementById('filter-size');
  const price = document.getElementById('filter-price');
  const availability = document.getElementById('filter-availability');
  const mobileFilters = window.matchMedia('(max-width: 680px)');

  if (filterPanel) {
    filterPanel.open = !mobileFilters.matches;
    mobileFilters.addEventListener('change', (event) => {
      filterPanel.open = !event.matches;
    });
  }

  function normalize(value) {
    return value
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function applyFilters() {
    const searchTerm = normalize(search.value);
    const selectedCategory = category.value;
    const selectedSize = size.value;
    const maximumPrice = price.value === '' ? null : Number(price.value);
    const selectedAvailability = availability.value;
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = normalize(`${card.dataset.search} ${card.textContent}`);
      const sizes = (card.dataset.sizes || '').split(/\s+/).filter(Boolean);
      const numericPrice = card.dataset.price === '' ? null : Number(card.dataset.price);
      const matches =
        (!searchTerm || text.includes(searchTerm)) &&
        (!selectedCategory || card.dataset.category === selectedCategory) &&
        (!selectedSize || sizes.includes(selectedSize)) &&
        (maximumPrice === null || (numericPrice !== null && Number.isFinite(numericPrice) && numericPrice <= maximumPrice)) &&
        (!selectedAvailability || card.dataset.availability === selectedAvailability);

      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (resultsCount) {
      resultsCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'prenda' : 'prendas'}`;
    }

    if (emptyResults) emptyResults.hidden = visibleCount !== 0;
  }

  function imageUrl(imageId, width) {
    if (imageId.startsWith('codigo/')) return imageId;
    return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=${width}&q=82`;
  }

  function connectGalleries() {
    document.querySelectorAll('[data-product-gallery]').forEach((gallery) => {
      const mainImage = gallery.querySelector('.product-main-image');
      const imageLink = gallery.querySelector('.product-image-link');
      const thumbnails = Array.from(gallery.querySelectorAll('.product-thumb'));

      thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', () => {
          const imageId = thumbnail.dataset.imageId;
          const alt = thumbnail.dataset.imageAlt;
          const photoHref = thumbnail.dataset.photoHref;

          if (!imageId || !mainImage || !imageLink) return;

          mainImage.src = imageUrl(imageId, 640);
          mainImage.srcset = imageId.startsWith('codigo/')
            ? ''
            : `${imageUrl(imageId, 360)} 360w, ${imageUrl(imageId, 640)} 640w, ${imageUrl(imageId, 960)} 960w`;
          mainImage.alt = alt;
          mainImage.dataset.imageId = imageId;
          mainImage.dataset.imageAlt = alt;
          imageLink.href = photoHref;
          imageLink.setAttribute('aria-label', `Abrir ${alt.toLocaleLowerCase('es')} en Unsplash`);

          thumbnails.forEach((item) => {
            const active = item === thumbnail;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
          });
        });
      });
    });
  }

  filterForm.addEventListener('input', applyFilters);
  filterForm.addEventListener('change', applyFilters);
  filterForm.addEventListener('reset', () => window.setTimeout(applyFilters, 0));
  connectGalleries();
  applyFilters();
})();
