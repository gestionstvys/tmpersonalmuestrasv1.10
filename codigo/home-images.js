(() => {
  const heroPhotoOrbit = document.querySelector(".hero-photo-orbit");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (heroPhotoOrbit && !prefersReducedMotion.matches) {
    let idleTimer;

    window.addEventListener("scroll", () => {
      heroPhotoOrbit.classList.add("is-scroll-accelerated");
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        heroPhotoOrbit.classList.remove("is-scroll-accelerated");
      }, 180);
    }, { passive: true });
  }

  document.querySelectorAll("img[data-image-slot]").forEach((image) => {
    const frame = image.closest(".photo-slot");
    if (!frame) return;

    const updatePhotoState = () => {
      frame.classList.toggle("has-photo", image.naturalWidth > 1);
    };

    image.addEventListener("load", updatePhotoState);
    updatePhotoState();
  });
})();
