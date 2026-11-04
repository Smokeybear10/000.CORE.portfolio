(() => {
  const sections = Array.from(document.querySelectorAll('.page-section'));
  const links = Array.from(document.querySelectorAll('.site-header nav a'));
  const main = document.getElementById('main');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let entrance;
  let initialScrollPending = true;
  const titles = { about: 'About — Thomas Ou', research: 'Research — Thomas Ou', projects: 'Projects — Thomas Ou', cv: 'CV — Thomas Ou', notes: 'Notes — Thomas Ou', blog: 'Blog — Thomas Ou', math: 'Math — Thomas Ou' };

  function navigate(moveFocus = false) {
    const requested = window.location.hash.slice(1) || 'about';
    const page = Object.hasOwn(titles, requested) ? requested : 'about';
    entrance?.cancel();
    sections.forEach(section => { section.hidden = section.id !== page; });
    links.forEach(link => {
      if (link.hash === `#${page}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = titles[page];
    if (moveFocus) {
      initialScrollPending = false;
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
      requestAnimationFrame(() => window.scrollTo(0, 0));
      if (!reducedMotion.matches) {
        entrance = document.getElementById(page).animate(
          [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)' }
        );
      }
    }
  }

  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: 'start' });
  });
  document.querySelectorAll('.site-header a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || link.hash !== window.location.hash) return;
      event.preventDefault();
      navigate(true);
    });
  });
  reducedMotion.addEventListener('change', event => { if (event.matches) entrance?.cancel(); });
  window.addEventListener('hashchange', () => navigate(true));
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(type => {
    window.addEventListener(type, () => { initialScrollPending = false; }, { once: true, passive: true });
  });
  window.addEventListener('load', async () => {
    await document.fonts.ready;
    // Safari can restore the fragment scroll during the first font-layout frame.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (initialScrollPending) window.scrollTo(0, 0);
      initialScrollPending = false;
    }));
  }, { once: true });
  navigate();
})();
