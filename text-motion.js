(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const roots = document.querySelectorAll('.name, .identity p, .site-header nav a, .biography p, .page-section > h1:not(.visually-hidden), .page-intro, .research-group-heading h2, .research-details h2, .research-details h3, .technical-projects li, .cv-group > h2, .cv-details h3, .cv-role, .notes-group-heading h2, .note-row h3, #attractor-title');
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, active: false };
  const items = Array.from(roots, element => {
    element.classList.add('reactive-text');
    if (getComputedStyle(element).display === 'inline') element.classList.add('reactive-text-inline');
    const range = document.createRange();
    range.selectNodeContents(element);
    return { element, range, x: 0, y: 0 };
  });
  let frame = 0;
  let previousTime = 0;

  function requestFrame() {
    if (!frame && !document.hidden && !reducedMotion.matches && finePointer.matches) frame = requestAnimationFrame(animate);
  }

  function animate(now) {
    frame = 0;
    const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = now;
    const pointerFollow = 1 - Math.exp(-delta * 14);
    const textFollow = 1 - Math.exp(-delta * 10);
    const targetStrength = pointer.active && window.getSelection()?.type !== 'Range' ? 1 : 0;
    pointer.x += (pointer.targetX - pointer.x) * pointerFollow;
    pointer.y += (pointer.targetY - pointer.y) * pointerFollow;
    pointer.strength += (targetStrength - pointer.strength) * (1 - Math.exp(-delta * 8));
    if (!targetStrength && pointer.strength < 0.001) pointer.strength = 0;

    const bounds = pointer.strength ? items.map(item => item.range.getBoundingClientRect()) : [];
    let moving = Math.abs(targetStrength - pointer.strength) > 0.001 ||
      (pointer.strength > 0 && Math.hypot(pointer.targetX - pointer.x, pointer.targetY - pointer.y) > 0.1);

    items.forEach((item, index) => {
      let targetX = 0;
      let targetY = 0;
      const rect = bounds[index];
      if (rect?.width && rect.height) {
        const left = rect.left - item.x;
        const top = rect.top - item.y;
        const edgeX = Math.max(left - pointer.x, 0, pointer.x - left - rect.width);
        const edgeY = Math.max(top - pointer.y, 0, pointer.y - top - rect.height);
        const proximity = Math.max(0, 1 - Math.hypot(edgeX, edgeY) / 180);
        const influence = proximity * proximity * (3 - 2 * proximity) * pointer.strength;
        targetX = Math.tanh((pointer.x - left - rect.width / 2) / 160) * 3 * influence;
        targetY = Math.tanh((pointer.y - top - rect.height / 2) / 100) * 2 * influence;
      }
      item.x += (targetX - item.x) * textFollow;
      item.y += (targetY - item.y) * textFollow;
      if (!targetX && !targetY && Math.hypot(item.x, item.y) < 0.01) {
        item.x = 0;
        item.y = 0;
        item.element.style.removeProperty('translate');
      } else {
        item.element.style.translate = `${item.x.toFixed(3)}px ${item.y.toFixed(3)}px`;
        if (Math.hypot(targetX - item.x, targetY - item.y) > 0.005) moving = true;
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
    pointer.strength = 0;
    items.forEach(item => {
      item.x = 0;
      item.y = 0;
      item.element.style.removeProperty('translate');
    });
  }

  window.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    if (event.pointerType === 'touch' || event.buttons) return release();
    if (!pointer.active) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
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
  document.addEventListener('selectionchange', () => { if (window.getSelection()?.type === 'Range') release(); });
  reducedMotion.addEventListener('change', reset);
  finePointer.addEventListener('change', reset);
})();
