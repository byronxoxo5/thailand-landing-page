(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const publicPages = new Set(['login.html', 'signup.html', 'signout.html']);
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  if (!publicPages.has(currentPage) && !sessionStorage.getItem('thaitrails-demo-session-email')) {
    const next = `${currentPage}${location.hash}`;
    location.replace(`login.html?next=${encodeURIComponent(next)}`);
    return;
  }

  // Sticky nav shadow
  const nav = $('#nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Mobile menu
  const burger = $('#burger'), links = $('#links');
  const setMenu = open => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (burger && links) {
    burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
    $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));
  }

  // Active link highlight
  const ids = ['home', 'overview', 'programme', 'reviews', 'contact'];
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) $$('.links a:not(.btn)').forEach(a =>
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(id => { const section = $('#' + id); if (section) spy.observe(section); });
  }

  // Itinerary: click a stop to highlight it
  const stops = $$('.stop');
  stops.forEach(s => s.addEventListener('click', () => {
    const was = s.classList.contains('active');
    stops.forEach(x => x.classList.remove('active'));
    if (!was) s.classList.add('active');
  }));

  // Reviews dots (mobile carousel)
  const cards = $('#cards'), dots = $('#dots'), items = $$('.review');
  if (cards && dots && items.length) {
    items.forEach(() => dots.appendChild(document.createElement('i')));
    const setDot = () => {
      const i = Math.round(cards.scrollLeft / (items[0].offsetWidth + 16));
      $$('i', dots).forEach((d, n) => d.classList.toggle('on', n === Math.min(i, items.length - 1)));
    };
    cards.addEventListener('scroll', setDot, { passive: true }); setDot();
  }

  // Modals (enquiry + trip details)
  const modal = $('#modal'), details = $('#details'), form = $('#form');
  let lastFocus;
  const show = m => {
    $$('.modal').forEach(x => x.hidden = true);
    lastFocus = lastFocus || document.activeElement;
    m.hidden = false;
    if (m === modal) form.hidden = false;
    (m === modal ? $('input', form) : $('.close', m)).focus();
  };
  const close = () => { $$('.modal').forEach(x => x.hidden = true); lastFocus && lastFocus.focus(); lastFocus = null; };
  if (modal) $$('[data-open-modal]').forEach(b => b.addEventListener('click', () => { setMenu(false); show(modal); }));
  if (details) $$('[data-open-details]').forEach(b => b.addEventListener('click', () => show(details)));
  $$('[data-close]').forEach(b => b.addEventListener('click', close));
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) close(); }));
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  // Form validation
  const rules = {
    name: v => v.trim().length >= 2 || 'Enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
    date: v => !!v || 'Choose a travel month.',
    people: v => (+v >= 1 && +v <= 20) || 'Enter between 1 and 20 travellers.'
  };
  const check = el => {
    const r = rules[el.name](el.value);
    el.classList.toggle('bad', r !== true);
    el.nextElementSibling.textContent = r === true ? '' : r;
    return r === true;
  };
  if (form) {
    $$('input', form).forEach(i => i.addEventListener('blur', () => check(i)));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = $$('input', form).map(check).every(Boolean);
      if (!ok) return $$('input.bad', form)[0].focus();
      const values = new FormData(form);
      const body = [
        `Booking request for the Thailand Discovery Tour`,
        `Name: ${values.get('name')}`,
        `Email: ${values.get('email')}`,
        `Preferred travel month: ${values.get('date')}`,
        `Number of travellers: ${values.get('people')}`
      ].join('\n');
      const bookingEmail = `mailto:hello@thaitrails.com?subject=${encodeURIComponent('Thailand trip booking request')}&body=${encodeURIComponent(body)}`;
      sessionStorage.setItem('thaitrails-booking', JSON.stringify({
        name: values.get('name'),
        email: values.get('email'),
        date: values.get('date'),
        people: values.get('people'),
        emailLink: bookingEmail
      }));
      window.location.href = 'booking-success.html';
    });
  }

  const reviewForm = $('#review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', event => {
      event.preventDefault();
      const values = new FormData(reviewForm);
      const name = String(values.get('name')).trim();
      const locationName = String(values.get('location')).trim();
      const review = String(values.get('review')).trim();
      const error = $('#review-error');
      if (name.length < 2 || review.length < 10) {
        error.hidden = false;
        error.textContent = 'Please enter your name and a review of at least 10 characters.';
        return;
      }
      const body = [
        `Traveler review from ${name}`,
        locationName ? `Location: ${locationName}` : '',
        '',
        review,
        '',
        'Please confirm permission before publishing this review.'
      ].filter(Boolean).join('\n');
      const emailLink = $('#review-email');
      emailLink.href = `mailto:hello@thaitrails.com?subject=${encodeURIComponent('Traveler experience for ThaiTrails')}&body=${encodeURIComponent(body)}`;
      emailLink.hidden = false;
      $('#review-success').hidden = false;
      error.hidden = true;
    });
  }
})();
