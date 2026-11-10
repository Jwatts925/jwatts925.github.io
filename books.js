(() => {
  'use strict';
  const library = document.querySelector('[data-books-library]');
  if (!library || !Array.isArray(window.PORTFOLIO_BOOKS)) return;

  const defaultBooks = window.PORTFOLIO_BOOKS;
  const orderStorageKey = 'james-watts:books:2026:order:v1';
  const books = restoreOrder(defaultBooks);
  const viewport = library.querySelector('[data-books-viewport]');
  const shelf = library.querySelector('[data-books-shelf]');
  const selection = library.querySelector('[data-books-selection]');
  const empty = library.querySelector('[data-books-empty]');
  const anchor = library.querySelector('[data-books-cover]');
  const cover = library.querySelector('[data-books-image]');
  const title = library.querySelector('[data-books-title]');
  const author = library.querySelector('[data-books-author]');
  const number = library.querySelector('[data-books-number]');
  const stars = library.querySelector('[data-books-stars]');
  const ratingLabel = library.querySelector('[data-books-rating]');
  const quoteText = library.querySelector('[data-books-quote]');
  const quoteEmpty = library.querySelector('[data-books-quote-empty]');
  const returnButton = library.querySelector('[data-books-return]');
  const hint = library.querySelector('[data-books-hint]');
  const status = library.querySelector('[data-books-status]');
  const scrollButtons = Array.from(library.querySelectorAll('[data-books-scroll]'));
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const defaultHint = 'Choose a spine to view its cover.';
  library.querySelector('.books-count').textContent = `${books.length} books`;
  viewport.setAttribute('aria-label', `2026 bookshelf — scroll horizontally to browse all ${books.length} books`);
  let activeIndex = -1;
  let flight;
  let gesture;
  let dragFrame;
  let suppressClickUntil = 0;
  const dropMarker = document.createElement('span');
  dropMarker.className = 'books-drop-marker';
  dropMarker.hidden = true;
  dropMarker.setAttribute('aria-hidden', 'true');

  function restoreOrder(catalog) {
    try {
      const saved = JSON.parse(window.localStorage.getItem(orderStorageKey));
      if (!Array.isArray(saved)) return [...catalog];
      const byId = new Map(catalog.map(book => [book.id, book]));
      const restored = [];
      for (const id of saved) {
        if (typeof id !== 'string' || !byId.has(id)) continue;
        restored.push(byId.get(id));
        byId.delete(id);
      }
      return restored.concat([...byId.values()]);
    } catch {
      return [...catalog];
    }
  }

  function saveOrder() {
    try {
      window.localStorage.setItem(orderStorageKey, JSON.stringify(books.map(book => book.id)));
      return true;
    } catch {
      return false;
    }
  }

  const preload = (book) => {
    if (book.preloaded) return;
    book.preloaded = true;
    const image = new Image();
    image.src = book.cover;
  };

  const spineButtons = books.map((book, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'books-spine';
    button.dataset.bookId = book.id;
    button.setAttribute('aria-label', `${book.title} by ${book.author}. Show cover.`);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-controls', 'books-selected');
    button.setAttribute('aria-describedby', 'books-arrange-help');
    button.setAttribute('aria-keyshortcuts', 'Alt+ArrowLeft Alt+ArrowRight');
    button.draggable = false;
    button.title = `${book.title} — ${book.author}`;
    button.style.setProperty('--book-width', `${book.width}px`);
    button.style.setProperty('--book-height', `${book.height}px`);
    button.style.setProperty('--book-color', book.color);
    button.style.setProperty('--book-ink', book.ink);
    button.style.setProperty('--spine-font', book.title.length > 25 ? '11px' : '14px');
    const spineTitle = document.createElement('span');
    spineTitle.className = 'books-spine-title';
    spineTitle.textContent = book.title;
    const spineAuthor = document.createElement('span');
    spineAuthor.className = 'books-spine-author';
    spineAuthor.textContent = book.author.split(' ').slice(-1)[0];
    button.append(spineTitle, spineAuthor);
    if (book.spine) {
      const image = document.createElement('img');
      image.className = 'books-spine-photo';
      image.src = book.spine;
      image.alt = '';
      image.decoding = 'async';
      image.setAttribute('aria-hidden', 'true');
      button.classList.add('has-spine-photo');
      button.appendChild(image);
      image.addEventListener('error', () => {
        image.hidden = true;
        button.classList.remove('has-spine-photo');
      });
    }
    const showHint = () => {
      hint.textContent = `${book.title} — ${book.author}`;
      preload(book);
    };
    button.addEventListener('pointerenter', showHint);
    button.addEventListener('focus', showHint);
    button.addEventListener('pointerleave', () => { hint.textContent = defaultHint; });
    button.addEventListener('blur', () => { hint.textContent = defaultHint; });
    button.addEventListener('click', (event) => {
      if (event.detail > 0 && performance.now() < suppressClickUntil) {
        event.preventDefault();
        return;
      }
      const index = books.findIndex(entry => entry.id === book.id);
      if (activeIndex === index) returnBook();
      else selectBook(index, true);
    });
    button.addEventListener('keydown', (event) => {
      const index = books.findIndex(entry => entry.id === book.id);
      if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        event.stopPropagation();
        moveBook(index, Math.max(0, Math.min(books.length - 1, index + (event.key === 'ArrowRight' ? 1 : -1))));
        return;
      }
      let target;
      if (event.key === 'ArrowRight') target = Math.min(books.length - 1, index + 1);
      if (event.key === 'ArrowLeft') target = Math.max(0, index - 1);
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = books.length - 1;
      if (target === undefined) return;
      event.preventDefault();
      spineButtons[target].focus({ preventScroll: true });
      revealSpine(target);
    });
    button.addEventListener('pointerdown', (event) => beginGesture(event, button));
    button.addEventListener('pointermove', moveGesture, { passive: false });
    button.addEventListener('pointerup', (event) => finishGesture(event, true));
    button.addEventListener('pointercancel', (event) => finishGesture(event, false));
    button.addEventListener('lostpointercapture', (event) => finishGesture(event, false));
    button.addEventListener('dragstart', (event) => event.preventDefault());
    button.addEventListener('contextmenu', (event) => {
      if (gesture) event.preventDefault();
    });
    shelf.appendChild(button);
    return button;
  });
  shelf.appendChild(dropMarker);

  function moveBook(from, to) {
    if (from === to) {
      status.textContent = `${books[from].title} stays at position ${from + 1} of ${books.length}.`;
      return;
    }
    const selectedId = books[activeIndex]?.id;
    const [book] = books.splice(from, 1);
    const [button] = spineButtons.splice(from, 1);
    books.splice(to, 0, book);
    spineButtons.splice(to, 0, button);
    shelf.insertBefore(button, spineButtons[to + 1] || dropMarker);
    activeIndex = selectedId ? books.findIndex(entry => entry.id === selectedId) : -1;
    if (activeIndex >= 0) number.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${books.length}`;
    const saved = saveOrder();
    status.textContent = `${book.title} moved to position ${to + 1} of ${books.length}. ${saved ? 'Order saved in this browser.' : 'Order could not be saved in this browser.'}`;
    hint.textContent = saved ? `${book.title} moved. Your order is saved on this device.` : 'Books moved. This browser could not save the arrangement.';
    button.focus({ preventScroll: true });
    revealSpine(to);
    updateScrollButtons();
  }

  function beginGesture(event, button) {
    if (event.pointerType !== 'mouse' || !event.isPrimary || event.button !== 0 || gesture) return;
    gesture = {
      pointerId: event.pointerId, button, mode: 'pending',
      startX: event.clientX, startY: event.clientY,
      x: event.clientX, y: event.clientY, scrollBehavior: viewport.style.scrollBehavior,
    };
    button.setPointerCapture(event.pointerId);
  }

  function startDrag() {
    if (!gesture || gesture.mode !== 'pending') return;
    gesture.mode = 'drag';
    gesture.sourceRect = gesture.button.getBoundingClientRect();
    gesture.ghost = gesture.button.cloneNode(true);
    gesture.ghost.classList.remove('is-selected');
    gesture.ghost.classList.add('books-drag-ghost');
    gesture.ghost.removeAttribute('data-book-id');
    gesture.ghost.removeAttribute('aria-controls');
    gesture.ghost.removeAttribute('aria-describedby');
    gesture.ghost.setAttribute('aria-hidden', 'true');
    gesture.ghost.tabIndex = -1;
    gesture.ghost.style.width = `${gesture.sourceRect.width}px`;
    gesture.ghost.style.height = `${gesture.sourceRect.height}px`;
    document.body.appendChild(gesture.ghost);
    gesture.button.classList.add('is-dragging');
    viewport.style.scrollBehavior = 'auto';
    library.classList.add('is-arranging');
    status.textContent = `Moving ${gesture.button.title}. Release to place it on the shelf. Escape cancels.`;
    updateDrag();
    dragFrame = requestAnimationFrame(scrollDuringDrag);
  }

  function moveGesture(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    gesture.x = event.clientX;
    gesture.y = event.clientY;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (gesture.mode === 'pending' && Math.hypot(dx, dy) >= 7) startDrag();
    if (gesture.mode === 'drag') {
      event.preventDefault();
      updateDrag();
    }
  }

  function updateDrag() {
    if (!gesture || gesture.mode !== 'drag') return;
    const source = gesture.sourceRect;
    gesture.ghost.style.left = `${source.left + gesture.x - gesture.startX}px`;
    gesture.ghost.style.top = `${source.top - 12 + Math.max(-20, Math.min(20, gesture.y - gesture.startY))}px`;
    const others = spineButtons.filter(button => button !== gesture.button);
    const index = others.findIndex(button => {
      const rect = button.getBoundingClientRect();
      return gesture.x < rect.left + rect.width / 2;
    });
    gesture.targetIndex = index < 0 ? others.length : index;
    const target = others[gesture.targetIndex];
    const boundary = target ? target.getBoundingClientRect().left - 2 : others.at(-1)?.getBoundingClientRect().right + 2;
    if (Number.isFinite(boundary)) {
      dropMarker.style.left = `${boundary - shelf.getBoundingClientRect().left}px`;
      dropMarker.hidden = false;
    }
  }

  function scrollDuringDrag() {
    if (!gesture || gesture.mode !== 'drag') return;
    const rect = viewport.getBoundingClientRect();
    let speed = 0;
    if (gesture.x < rect.left + 44) speed = -Math.min(14, (rect.left + 44 - gesture.x) / 3);
    if (gesture.x > rect.right - 44) speed = Math.min(14, (gesture.x - rect.right + 44) / 3);
    if (speed) {
      viewport.scrollLeft += speed;
      updateDrag();
    }
    dragFrame = requestAnimationFrame(scrollDuringDrag);
  }

  function finishGesture(event, commit) {
    if (!gesture || (event && event.pointerId !== gesture.pointerId)) return;
    const current = gesture;
    gesture = undefined;
    cancelAnimationFrame(dragFrame);
    current.ghost?.remove();
    current.button.classList.remove('is-dragging');
    library.classList.remove('is-arranging');
    dropMarker.hidden = true;
    viewport.style.scrollBehavior = current.scrollBehavior;
    if (current.button.hasPointerCapture(current.pointerId)) current.button.releasePointerCapture(current.pointerId);
    if (current.mode === 'drag') {
      suppressClickUntil = performance.now() + 450;
      if (commit) {
        const from = spineButtons.indexOf(current.button);
        moveBook(from, current.targetIndex ?? from);
      } else {
        status.textContent = 'Book move cancelled.';
      }
    }
  }

  library.querySelector('[data-books-reset-order]').addEventListener('click', () => {
    finishGesture(null, false);
    const selectedId = books[activeIndex]?.id;
    const byId = new Map(spineButtons.map(button => [button.dataset.bookId, button]));
    books.splice(0, books.length, ...defaultBooks);
    spineButtons.splice(0, spineButtons.length, ...books.map(book => byId.get(book.id)));
    spineButtons.forEach(button => shelf.insertBefore(button, dropMarker));
    activeIndex = selectedId ? books.findIndex(book => book.id === selectedId) : -1;
    if (activeIndex >= 0) number.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${books.length}`;
    try { window.localStorage.removeItem(orderStorageKey); } catch { /* The order is still reset for this visit. */ }
    status.textContent = 'Original shelf order restored.';
    hint.textContent = defaultHint;
    updateScrollButtons();
  });

  function revealSpine(index) {
    const button = spineButtons[index];
    const left = button.offsetLeft;
    const right = left + button.offsetWidth;
    const margin = 30;
    if (left - margin < viewport.scrollLeft) {
      viewport.scrollTo({ left: Math.max(0, left - margin), behavior: motionPreference.matches ? 'auto' : 'smooth' });
    } else if (right + margin > viewport.scrollLeft + viewport.clientWidth) {
      viewport.scrollTo({ left: right + margin - viewport.clientWidth, behavior: motionPreference.matches ? 'auto' : 'smooth' });
    }
  }

  function updateScrollButtons() {
    scrollButtons.forEach((button) => {
      const direction = Number(button.dataset.booksScroll);
      button.disabled = direction < 0 ? viewport.scrollLeft <= 2 : viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 2;
    });
  }

  function selectBook(index, animate) {
    if (flight) flight.cancel();
    const book = books[index];
    const sourceRect = spineButtons[index].getBoundingClientRect();
    activeIndex = index;
    spineButtons.forEach((button, i) => {
      button.classList.toggle('is-selected', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    empty.hidden = true;
    selection.hidden = false;
    anchor.style.setProperty('--book-color', book.color);
    anchor.style.setProperty('--book-ink', book.ink);
    title.textContent = book.title;
    author.textContent = book.author;
    number.textContent = `${String(index + 1).padStart(2, '0')} / ${books.length}`;
    library.querySelector('[data-books-fallback-title]').textContent = book.title;
    library.querySelector('[data-books-fallback-author]').textContent = book.author;
    cover.hidden = false;
    cover.alt = `Cover of ${book.title} by ${book.author}`;
    cover.src = book.cover;
    const hasRating = Number.isFinite(book.rating) && book.rating >= 1 && book.rating <= 10;
    const rating = hasRating ? book.rating : 0;
    stars.replaceChildren();
    for (let i = 1; i <= 10; i += 1) {
      const star = document.createElement('span');
      star.textContent = i <= rating ? '★' : '☆';
      if (i > rating) star.className = 'is-empty';
      stars.appendChild(star);
    }
    ratingLabel.textContent = hasRating ? `${rating} / 10` : 'Not rated yet';
    const hasQuote = typeof book.quote === 'string' && book.quote.trim().length > 0;
    library.querySelector('.books-quote').hidden = !hasQuote;
    quoteText.hidden = !hasQuote;
    quoteEmpty.hidden = hasQuote;
    quoteText.textContent = hasQuote ? book.quote : '';
    status.textContent = `${book.title} by ${book.author}. ${hasRating ? `Rated ${rating} out of 10.` : 'Not rated yet.'}`;
    if (animate && !motionPreference.matches && typeof anchor.animate === 'function') {
      const targetRect = anchor.getBoundingClientRect();
      const x = sourceRect.left + sourceRect.width / 2 - targetRect.left - targetRect.width / 2;
      const y = sourceRect.top + sourceRect.height / 2 - targetRect.top - targetRect.height / 2;
      flight = anchor.animate([
        { transform: `translate(${x}px, ${y}px) scale(.22, .8)`, opacity: .3 },
        { transform: `translate(${x * .2}px, -22px) scale(.95)`, opacity: 1, offset: .62 },
        { transform: 'translate(0, 0) scale(1)', opacity: 1 }
      ], { duration: 720, easing: 'cubic-bezier(.2,.72,.2,1)' });
    }
    if (animate) revealSpine(index);
    if (books[index + 1]) preload(books[index + 1]);
  }

  function returnBook() {
    if (flight) flight.cancel();
    if (activeIndex < 0) return;
    const previous = activeIndex;
    activeIndex = -1;
    spineButtons[previous].classList.remove('is-selected');
    spineButtons[previous].setAttribute('aria-pressed', 'false');
    selection.hidden = true;
    empty.hidden = false;
    status.textContent = `${books[previous].title} returned to the shelf.`;
    spineButtons[previous].focus({ preventScroll: true });
  }

  cover.addEventListener('error', () => { cover.hidden = true; });
  cover.addEventListener('load', () => { cover.hidden = false; });
  returnButton.addEventListener('click', returnBook);
  library.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && gesture) {
      event.preventDefault();
      event.stopPropagation();
      finishGesture(null, false);
      return;
    }
    if (event.key === 'Escape' && activeIndex >= 0) {
      event.preventDefault();
      returnBook();
    }
  });
  scrollButtons.forEach((button) => {
    button.addEventListener('click', () => {
      viewport.scrollBy({ left: Number(button.dataset.booksScroll) * viewport.clientWidth * .75, behavior: motionPreference.matches ? 'auto' : 'smooth' });
    });
  });
  viewport.addEventListener('scroll', updateScrollButtons, { passive: true });
  window.addEventListener('resize', updateScrollButtons);
  document.getElementById('books').addEventListener('toggle', () => {
    if (document.getElementById('books').open) requestAnimationFrame(updateScrollButtons);
  });
  hint.textContent = defaultHint;
  selectBook(0, false);
  updateScrollButtons();
})();
