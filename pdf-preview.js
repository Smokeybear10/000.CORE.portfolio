(() => {
  const dialog = document.getElementById('pdf-preview');
  if (!dialog?.showModal) return;

  const title = document.getElementById('pdf-preview-title');
  const metadata = document.getElementById('pdf-preview-meta');
  const body = dialog.querySelector('.pdf-preview-body');
  const pageContainer = dialog.querySelector('.pdf-preview-page');
  const status = dialog.querySelector('.pdf-preview-status');
  const fullPdf = dialog.querySelector('.pdf-preview-full');
  const previous = dialog.querySelector('.pdf-preview-previous');
  const next = dialog.querySelector('.pdf-preview-next');
  const counter = document.getElementById('pdf-preview-count');
  const previewRoot = new URL(dialog.dataset.previewRoot, document.baseURI);
  const pageCount = 3;
  let page = 1;
  let filename = '';
  let opener;
  let activeImage;
  let backdropPressed = false;

  function renderPage() {
    const image = new Image();
    activeImage = image;
    image.alt = `${title.textContent}, handwritten notes, page ${page}`;
    image.decoding = 'async';
    image.hidden = true;
    body.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading preview…';
    status.hidden = false;
    const focusedControl = document.activeElement;
    previous.disabled = page === 1;
    next.disabled = page === pageCount;
    if (focusedControl === previous && previous.disabled) next.focus({ preventScroll: true });
    else if (focusedControl === next && next.disabled) previous.focus({ preventScroll: true });
    counter.textContent = `${page} / ${pageCount}`;
    image.onload = () => {
      if (image !== activeImage) return;
      image.hidden = false;
      status.hidden = true;
      body.setAttribute('aria-busy', 'false');
    };
    image.onerror = () => {
      if (image !== activeImage) return;
      status.textContent = 'Preview unavailable. You can still open the full PDF below.';
      body.setAttribute('aria-busy', 'false');
    };
    pageContainer.replaceChildren(image);
    body.scrollTop = 0;
    image.src = new URL(`${filename}-${page}.webp`, previewRoot).href;
  }

  function changePage(direction) {
    const target = page + direction;
    if (target < 1 || target > pageCount) return;
    page = target;
    renderPage();
  }

  document.querySelectorAll('.note-title, .note-pdf').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.setAttribute('aria-label', link.getAttribute('aria-label').replace('Open PDF:', 'Preview PDF:').replace('; opens in a new tab', '; 3-page preview'));
    link.querySelector('.pdf-label-prefix')?.replaceChildren('Preview ');
    link.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const row = link.closest('.note-row');
      title.textContent = row.querySelector('.note-title').textContent;
      metadata.textContent = `First ${pageCount} pages · ${row.querySelector('.note-origin').textContent}`;
      fullPdf.href = link.href;
      filename = decodeURIComponent(new URL(link.href).pathname.split('/').pop()).replace(/\.pdf$/i, '');
      page = 1;
      document.documentElement.classList.add('pdf-preview-open');
      dialog.showModal();
      renderPage();
    });
  });

  previous.addEventListener('click', () => changePage(-1));
  next.addEventListener('click', () => changePage(1));
  dialog.querySelector('.pdf-preview-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    changePage(event.key === 'ArrowRight' ? 1 : -1);
  });
  function outsideDialog(event) {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  dialog.addEventListener('pointerdown', event => { backdropPressed = outsideDialog(event); });
  dialog.addEventListener('click', event => {
    if (backdropPressed && outsideDialog(event)) dialog.close();
    backdropPressed = false;
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('pdf-preview-open');
    activeImage = null;
    pageContainer.replaceChildren();
    body.setAttribute('aria-busy', 'false');
    if (opener?.getClientRects().length) opener.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });
})();
