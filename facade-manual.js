const manualGallery = document.querySelector('[data-manual-gallery]');
const manualLightbox = document.querySelector('[data-manual-lightbox]');

if (manualGallery && manualLightbox) {
  const pageCount = Number.parseInt(manualGallery.dataset.pageCount || '0', 10);
  const pageSources = Array.from(
    { length: pageCount },
    (_, index) => `assets/facade-manual/page-${String(index + 1).padStart(2, '0')}.webp`
  );

  pageSources.forEach((source, index) => {
    const button = document.createElement('button');
    const image = document.createElement('img');
    const pageNumber = index + 1;

    button.className = 'manual-page-tile';
    button.type = 'button';
    button.dataset.pageIndex = String(index);
    button.setAttribute('aria-label', `Enlarge manual page ${pageNumber}`);

    image.src = source;
    image.alt = `Facade Design Manual page ${pageNumber}`;
    image.decoding = 'async';
    image.loading = index < 6 ? 'eager' : 'lazy';
    if (index < 3) image.fetchPriority = 'high';

    button.append(image);
    manualGallery.append(button);
  });

  const lightboxImage = manualLightbox.querySelector('[data-lightbox-image]');
  const lightboxStage = manualLightbox.querySelector('[data-lightbox-stage]');
  const closeButton = manualLightbox.querySelector('[data-lightbox-close]');
  const previousButton = manualLightbox.querySelector('[data-lightbox-previous]');
  const nextButton = manualLightbox.querySelector('[data-lightbox-next]');
  const pointers = new Map();

  let currentIndex = 0;
  let returnFocus = null;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let panStart = null;
  let pinchStart = null;

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

  const applyTransform = () => {
    lightboxImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  };

  const resetTransform = () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    panStart = null;
    pinchStart = null;
    pointers.clear();
    applyTransform();
  };

  const setScale = (nextScale) => {
    scale = clamp(nextScale, 1, 5);
    if (scale === 1) {
      translateX = 0;
      translateY = 0;
    }
    applyTransform();
  };

  const preloadAdjacentPage = (index) => {
    if (!pageSources[index]) return;
    const preloadImage = new Image();
    preloadImage.src = pageSources[index];
  };

  const showPage = (index) => {
    currentIndex = clamp(index, 0, pageSources.length - 1);
    resetTransform();
    lightboxImage.src = pageSources[currentIndex];
    lightboxImage.alt = `Facade Design Manual page ${currentIndex + 1}`;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === pageSources.length - 1;
    preloadAdjacentPage(currentIndex - 1);
    preloadAdjacentPage(currentIndex + 1);
  };

  const openLightbox = (index, trigger) => {
    returnFocus = trigger;
    showPage(index);
    manualLightbox.hidden = false;
    document.body.classList.add('manual-lightbox-open');
    closeButton.focus();
  };

  const closeLightbox = () => {
    manualLightbox.hidden = true;
    lightboxImage.src = '';
    document.body.classList.remove('manual-lightbox-open');
    resetTransform();
    returnFocus?.focus();
  };

  manualGallery.addEventListener('click', (event) => {
    const tile = event.target.closest('.manual-page-tile');
    if (!tile) return;
    openLightbox(Number.parseInt(tile.dataset.pageIndex, 10), tile);
  });

  closeButton.addEventListener('click', closeLightbox);
  previousButton.addEventListener('click', () => showPage(currentIndex - 1));
  nextButton.addEventListener('click', () => showPage(currentIndex + 1));

  manualLightbox.addEventListener('click', (event) => {
    if (event.target === manualLightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (manualLightbox.hidden) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft' && currentIndex > 0) showPage(currentIndex - 1);
    if (event.key === 'ArrowRight' && currentIndex < pageSources.length - 1) showPage(currentIndex + 1);

    if (event.key === 'Tab') {
      const controls = [closeButton, previousButton, nextButton].filter((control) => !control.disabled);
      const firstControl = controls[0];
      const lastControl = controls[controls.length - 1];

      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      }
    }
  });

  const pointerDistance = (pointerList) => {
    const [firstPointer, secondPointer] = pointerList;
    return Math.hypot(secondPointer.clientX - firstPointer.clientX, secondPointer.clientY - firstPointer.clientY);
  };

  const pointerCenter = (pointerList) => {
    const [firstPointer, secondPointer] = pointerList;
    return {
      x: (firstPointer.clientX + secondPointer.clientX) / 2,
      y: (firstPointer.clientY + secondPointer.clientY) / 2,
    };
  };

  lightboxStage.addEventListener('pointerdown', (event) => {
    pointers.set(event.pointerId, event);
    lightboxStage.setPointerCapture(event.pointerId);

    if (pointers.size === 1) {
      panStart = {
        clientX: event.clientX,
        clientY: event.clientY,
        translateX,
        translateY,
      };
    } else if (pointers.size === 2) {
      const pointerList = [...pointers.values()];
      pinchStart = {
        distance: pointerDistance(pointerList),
        center: pointerCenter(pointerList),
        scale,
        translateX,
        translateY,
      };
      panStart = null;
    }
  });

  lightboxStage.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, event);

    if (pointers.size === 2 && pinchStart) {
      const pointerList = [...pointers.values()];
      const center = pointerCenter(pointerList);
      scale = clamp(pinchStart.scale * (pointerDistance(pointerList) / pinchStart.distance), 1, 5);
      translateX = pinchStart.translateX + center.x - pinchStart.center.x;
      translateY = pinchStart.translateY + center.y - pinchStart.center.y;
      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }
      applyTransform();
    } else if (pointers.size === 1 && panStart && scale > 1) {
      translateX = panStart.translateX + event.clientX - panStart.clientX;
      translateY = panStart.translateY + event.clientY - panStart.clientY;
      applyTransform();
    }
  });

  const releasePointer = (event) => {
    pointers.delete(event.pointerId);
    pinchStart = null;

    if (pointers.size === 1) {
      const remainingPointer = [...pointers.values()][0];
      panStart = {
        clientX: remainingPointer.clientX,
        clientY: remainingPointer.clientY,
        translateX,
        translateY,
      };
    } else {
      panStart = null;
    }
  };

  lightboxStage.addEventListener('pointerup', releasePointer);
  lightboxStage.addEventListener('pointercancel', releasePointer);

  lightboxStage.addEventListener('wheel', (event) => {
    event.preventDefault();
    setScale(scale + (event.deltaY < 0 ? 0.25 : -0.25));
  }, { passive: false });

  lightboxStage.addEventListener('dblclick', () => {
    setScale(scale > 1 ? 1 : 2.25);
  });
}
