(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const roots = document.querySelectorAll('.name, .identity p, .site-header nav a, .biography p, .page-section > h1:not(.visually-hidden), .page-intro, .cv-group > h2, .cv-details h3, .cv-role, .notes-group-heading h2, .note-title, #attractor-title, footer nav a');
  const pointer = { x: 0, y: 0, active: false };
  let words = [];
  let frame = 0;
  let previousTime = 0;

  function wrapWords(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim() && !walker.currentNode.parentElement.closest('.reactive-word')) nodes.push(walker.currentNode);
    }
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(text => {
        if (!text.trim()) fragment.append(document.createTextNode(text));
        else {
          const word = document.createElement('span');
          word.className = 'reactive-word';
          word.textContent = text;
          fragment.append(word);
        }
      });
      node.replaceWith(fragment);
    });
  }

  function requestFrame() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(animate);
  }

  function animate(now) {
    frame = 0;
    const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = now;
    const follow = 1 - Math.exp(-delta * 12);
    const active = pointer.active && window.getSelection()?.type !== 'Range';
    const bounds = active ? words.map(word => word.element.getBoundingClientRect()) : [];
    let moving = false;

    words.forEach((word, index) => {
      let targetX = 0;
      let targetY = 0;
      const rect = bounds[index];
      if (rect?.width && rect.height) {
        const dx = pointer.x - (rect.left + rect.width / 2 - word.x);
        const dy = pointer.y - (rect.top + rect.height / 2 - word.y);
        const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 150);
        targetX = dx * 0.055 * influence * influence;
        targetY = dy * 0.09 * influence * influence;
      }
      word.x += (targetX - word.x) * follow;
      word.y += (targetY - word.y) * follow;
      if (Math.hypot(targetX - word.x, targetY - word.y) > 0.01) moving = true;
      if (!targetX && !targetY && Math.hypot(word.x, word.y) < 0.01) {
        word.x = 0;
        word.y = 0;
        word.element.style.removeProperty('transform');
      } else {
        word.element.style.transform = `translate(${word.x.toFixed(2)}px, ${word.y.toFixed(2)}px)`;
      }
    });

    if (moving) requestFrame();
    else previousTime = 0;
  }

  function release() {
    pointer.active = false;
    requestFrame();
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    pointer.active = false;
    words.forEach(word => {
      word.x = 0;
      word.y = 0;
      word.element.style.removeProperty('transform');
    });
  }

  roots.forEach(wrapWords);
  words = Array.from(document.querySelectorAll('.reactive-word'), element => ({ element, x: 0, y: 0 }));

  window.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    if (event.pointerType === 'touch' || event.buttons) return release();
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    requestFrame();
  }, { passive: true });
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) release(); });
  window.addEventListener('pointerdown', release, { passive: true });
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
  window.addEventListener('keydown', release);
  window.addEventListener('scroll', release, { passive: true });
  window.addEventListener('resize', reset);
  window.addEventListener('hashchange', reset);
  document.addEventListener('visibilitychange', reset);
  reducedMotion.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
})();
