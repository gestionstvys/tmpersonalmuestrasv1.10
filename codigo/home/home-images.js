(() => {
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
