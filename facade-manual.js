/* One portrait cover, then 56 complete spreads. Each spread uses two exact
   half-width viewports of the same original image; no content is cropped away. */
(() => {
  'use strict';
  const host = document.getElementById('manual-book');
  const stage = document.getElementById('book-stage');
  const position = document.getElementById('book-position');
  const previous = document.getElementById('previous-page');
  const next = document.getElementById('next-page');
  const status = document.getElementById('book-status');
  const hint = document.getElementById('book-hint');
  const loading = document.getElementById('loading-note');
  const error = document.getElementById('book-error');
  const SPREADS = 56, LAST_PAGE = 113, RATIO = 1531 / 1978;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let pageFlip, busy = false, current = 0, sizeKey = '';
  const images = new Map();
  const source = n => `assets/facade-manual/page-${String(n).padStart(2, '0')}.webp`;

  function loadImage(number, retry = false) {
    if (retry) images.delete(number);
    if (!images.has(number)) {
      const image = new Image();
      const promise = new Promise((resolve, reject) => {
        image.onload = async () => {
          try { await image.decode(); } catch (_) { /* Loaded images can still render if decode is unsupported. */ }
          resolve(image);
        };
        image.onerror = () => reject(new Error(`Spread ${number} failed to load`));
      });
      image.src = source(number);
      images.set(number, promise);
    }
    return images.get(number);
  }
  function makePage(number, side, cover = false) {
    const page = document.createElement('div');
    page.className = `book-page ${cover ? 'is-cover' : `is-${side}`}`;
    if (cover) page.dataset.density = 'hard';
    page.dataset.source = String(number);
    const art = document.createElement('div');
    art.className = 'page-art';
    const img = document.createElement('img');
    img.alt = cover ? 'Facade Design Manual — cover, written by James Watts' : `Spread ${number - 1} of ${SPREADS}, ${side} page`;
    img.draggable = false;
    img.decoding = 'async';
    if (number <= 3) img.src = source(number);
    else img.dataset.src = source(number);
    art.append(img); page.append(art);
    return page;
  }
  const pages = [makePage(1, 'right', true)];
  for (let n = 2; n <= SPREADS + 1; n++) pages.push(makePage(n, 'left'), makePage(n, 'right'));
  const back = document.createElement('div');
  back.className = 'book-page is-cover is-back';
  back.dataset.density = 'hard';
  back.setAttribute('aria-label', 'Back cover');
  pages.push(back);
  pages.forEach(page => host.append(page));

  function warmPages(index) {
    const target = Math.ceil(index / 2) + 1;
    for (let n = Math.max(1, target - 2); n <= Math.min(SPREADS + 1, target + 3); n++) {
      host.querySelectorAll(`[data-source="${n}"] img[data-src]`).forEach(img => {
        img.src = img.dataset.src; delete img.dataset.src;
      });
      loadImage(n).catch(() => {});
    }
  }
  function sync(index) {
    current = index;
    position.classList.toggle('is-front-cover', index === 0);
    position.classList.toggle('is-back-cover', index === LAST_PAGE);
    previous.disabled = index === 0; next.disabled = index === LAST_PAGE;
    next.setAttribute('aria-label', index === 0 ? 'Open book' : 'Next spread');
    status.textContent = index === 0 ? 'Cover' : index === LAST_PAGE ? 'Back cover' : `Spread ${Math.ceil(index / 2)} / ${SPREADS}`;
    hint.textContent = index === 0 ? 'Click the cover to open' : index === LAST_PAGE ? 'Click the cover to return' : 'Drag a corner · Swipe or use ← →';
    host.setAttribute('aria-label', `${status.textContent}. Drag a corner or click a page to turn it.`);
    warmPages(index);
  }
  function fitBook() {
    const pageHeight = Math.max(90, Math.min(stage.clientHeight - 14, (stage.clientWidth - 14) / (2 * RATIO), 1000));
    const pageWidth = pageHeight * RATIO;
    const key = `${Math.round(pageWidth)}:${Math.round(pageHeight)}`;
    if (key === sizeKey) return;
    sizeKey = key;
    position.style.width = `${pageWidth * 2}px`; position.style.height = `${pageHeight}px`;
    host.style.width = `${pageWidth * 2}px`; host.style.height = `${pageHeight}px`;
    if (pageFlip) {
      pageFlip.getSettings().width = pageWidth; pageFlip.getSettings().height = pageHeight;
      pageFlip.update();
    }
    return { pageWidth, pageHeight };
  }
  async function turn(direction) {
    if (!pageFlip || busy || (direction > 0 && current === LAST_PAGE) || (direction < 0 && current === 0)) return;
    const targetIndex = current + direction * 2;
    const targetSource = Math.max(1, Math.min(SPREADS + 1, Math.ceil(targetIndex / 2) + 1));
    error.hidden = true; busy = true; warmPages(targetIndex);
    try {
      await loadImage(targetSource);
      if (reducedMotion.matches) {
        direction > 0 ? pageFlip.turnToNextPage() : pageFlip.turnToPrevPage(); busy = false;
      } else direction > 0 ? pageFlip.flipNext('bottom') : pageFlip.flipPrev('bottom');
    } catch (_) {
      error.hidden = false; error.dataset.failedSource = String(targetSource);
      error.dataset.direction = String(direction); busy = false;
    }
  }
  previous.addEventListener('click', () => turn(-1));
  next.addEventListener('click', () => turn(1));
  document.getElementById('retry-spread').addEventListener('click', async () => {
    try { await loadImage(Number(error.dataset.failedSource), true); } catch (_) { return; }
    turn(Number(error.dataset.direction));
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); turn(event.key === 'ArrowRight' ? 1 : -1);
    }
    if (event.key === 'Home' && pageFlip && !busy) { event.preventDefault(); pageFlip.turnToPage(0); }
    if (event.key === 'End' && pageFlip && !busy) { event.preventDefault(); warmPages(LAST_PAGE); pageFlip.turnToPage(LAST_PAGE); }
  });
  async function init() {
    try {
      if (!window.St?.PageFlip) throw new Error('Page turn library unavailable');
      await loadImage(1);
      await pages[0].querySelector('img').decode();
      const { pageWidth, pageHeight } = fitBook();
      pageFlip = new St.PageFlip(host, {
        width: pageWidth, height: pageHeight, size: 'fixed', usePortrait: false,
        showCover: true, autoSize: false, drawShadow: true, maxShadowOpacity: .28,
        flippingTime: reducedMotion.matches ? 1 : 950,
        mobileScrollSupport: true, swipeDistance: 24, showPageCorners: !reducedMotion.matches,
        useMouseEvents: !reducedMotion.matches
      });
      pageFlip.on('flip', event => sync(event.data));
      pageFlip.on('changeState', event => {
        busy = event.data !== 'read'; position.classList.toggle('is-turning', busy);
      });
      pageFlip.on('init', () => {
        sync(0); position.classList.add('is-ready'); loading.hidden = true;
      });
      pageFlip.loadFromHTML(pages);
      if (reducedMotion.matches) host.addEventListener('click', e => {
        const bounds = host.getBoundingClientRect();
        turn(e.clientX < bounds.left + bounds.width / 2 && current !== 0 ? -1 : 1);
      });
      new ResizeObserver(() => requestAnimationFrame(fitBook)).observe(stage);
    } catch (_) {
      loading.textContent = 'The book couldn’t open. Please refresh to try again.'; next.disabled = true;
    }
  }
  init();
})();
