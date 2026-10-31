(() => {
  const sections = Array.from(document.querySelectorAll('.page-section'));
  const links = Array.from(document.querySelectorAll('.site-header nav a'));
  const main = document.getElementById('main');
  const titles = { home: 'Thomas Ou' };

  function navigate(moveFocus = false) {
    const requested = window.location.hash.slice(1) || 'home';
    const page = Object.hasOwn(titles, requested) ? requested : 'home';
    sections.forEach(section => { section.hidden = section.id !== page; });
    links.forEach(link => {
      if (link.hash === `#${page}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = titles[page];
    if (moveFocus) {
      window.scrollTo(0, 0);
      main.focus({ preventScroll: true });
    }
  }

  document.querySelector('.skip-link').addEventListener('click', event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView({ block: 'start' });
  });
  window.addEventListener('hashchange', () => navigate(true));
  navigate();
})();
