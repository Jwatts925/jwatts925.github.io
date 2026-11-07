(() => {
  'use strict';
  const library = document.querySelector('[data-books-library]');
  if (!library || !Array.isArray(window.PORTFOLIO_BOOKS)) return;

  const books = window.PORTFOLIO_BOOKS;
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
  const defaultHint = 'Click a spine to pull out a book. Scroll to explore the whole shelf.';
  library.querySelector('.books-count').textContent = `${books.length} books`;
  viewport.setAttribute('aria-label', `2026 bookshelf — scroll horizontally to browse all ${books.length} books`);
  let activeIndex = -1;
  let flight;

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
    button.addEventListener('click', () => {
      if (activeIndex === index) returnBook();
      else selectBook(index, true);
    });
    button.addEventListener('keydown', (event) => {
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
    shelf.appendChild(button);
    return button;
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
