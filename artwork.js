(() => {
  const gallery = document.querySelector('[data-artwork-gallery]');
  const dialog = document.querySelector('[data-artwork-dialog]');
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

  const pieces = Array.from(gallery.querySelectorAll('.artwork-piece'));
  const stage = dialog.querySelector('[data-artwork-stage]');
  const title = dialog.querySelector('#artwork-viewer-title');
  const meta = dialog.querySelector('#artwork-viewer-meta');
  const count = dialog.querySelector('[data-artwork-count]');
  let currentIndex = 0;
  let returnFocus;
  let previousOverflow;

  const showPiece = (index) => {
    currentIndex = (index + pieces.length) % pieces.length;
    const piece = pieces[currentIndex];
    const images = piece.querySelector('.artwork-images').cloneNode(true);
    let ratio = 0;
    images.querySelectorAll('.artwork-frame').forEach((frame) => {
      const [width, height] = frame.style.getPropertyValue('--art-ratio').split('/').map(Number);
      ratio += width / height;
      const image = frame.querySelector('img');
      image.loading = 'eager';
      image.fetchPriority = 'high';
      // Keep the cached gallery image visible while the larger copy loads.
      const largeImage = new Image();
      largeImage.src = image.dataset.largeSrc;
      largeImage.decode().then(() => {
        if (stage.contains(image)) image.src = largeImage.src;
      }).catch(() => { /* The gallery image remains available if loading fails. */ });
    });
    // Allow room for the space between paired panels as well as the paintings.
    images.style.setProperty('--viewer-ratio', ratio * (images.children.length > 1 ? 1.08 : 1));
    stage.replaceChildren(images);
    title.textContent = piece.querySelector('h3').textContent;
    meta.textContent = piece.querySelector('.artwork-caption p').textContent;
    count.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${pieces.length}`;
  };

  gallery.addEventListener('click', (event) => {
    const button = event.target.closest('[data-artwork-open]');
    if (!button) return;
    returnFocus = button;
    showPiece(Number(button.dataset.artworkOpen));
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('artwork-viewer-open');
    dialog.showModal();
  });

  dialog.querySelector('[data-artwork-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-artwork-prev]').addEventListener('click', () => showPiece(currentIndex - 1));
  dialog.querySelector('[data-artwork-next]').addEventListener('click', () => showPiece(currentIndex + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showPiece(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    document.body.classList.remove('artwork-viewer-open');
    stage.replaceChildren();
    returnFocus?.focus({ preventScroll: true });
  });
})();
