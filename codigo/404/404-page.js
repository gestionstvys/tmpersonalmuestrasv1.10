(() => {
  const scene = document.querySelector("[data-motion-scene]");
  if (!scene) return;

  let sceneVisible = true;
  const updateMotion = () => {
    document.documentElement.classList.toggle(
      "error404-motion-paused",
      document.hidden || !sceneVisible,
    );
  };

  document.addEventListener("visibilitychange", updateMotion);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      sceneVisible = entry.isIntersecting;
      updateMotion();
    }, { threshold: 0.05 });
    observer.observe(scene);
  }

  updateMotion();
})();

