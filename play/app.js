(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const text = [...document.querySelectorAll('.brand, .page-title, .project-heading h2')].map(element => ({ element, x: 0, y: 0, bounds: null }));
  let pointer = null;
  let frame = 0;
  let previous = 0;
  let needsMeasurement = true;

  function measureText() {
    needsMeasurement = true;
  }

  function moveText(now) {
    const delta = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
    previous = now;
    const follow = 1 - Math.exp(-delta * 10);
    let moving = false;

    if (needsMeasurement) {
      text.forEach(item => {
        const rect = item.element.getBoundingClientRect();
        item.bounds = { x: rect.left + rect.width / 2 - item.x, y: rect.top + rect.height / 2 - item.y, visible: rect.height > 0 };
      });
      needsMeasurement = false;
    }

    text.forEach(item => {
      const dx = pointer && item.bounds.visible ? pointer.x - item.bounds.x : 0;
      const dy = pointer && item.bounds.visible ? pointer.y - item.bounds.y : 0;
      const distance = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - distance / 240) ** 2;
      const targetX = Math.tanh(dx / 70) * influence * 3;
      const targetY = Math.tanh(dy / 70) * influence * 2;
      item.x += (targetX - item.x) * follow;
      item.y += (targetY - item.y) * follow;
      if (Math.abs(targetX - item.x) + Math.abs(targetY - item.y) > .005) moving = true;
      item.element.style.setProperty('--text-x', `${item.x.toFixed(3)}px`);
      item.element.style.setProperty('--text-y', `${item.y.toFixed(3)}px`);
    });

    frame = moving ? requestAnimationFrame(moveText) : 0;
    if (!frame) previous = 0;
  }

  function scheduleText() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(moveText);
  }

  function releaseText() {
    pointer = null;
    scheduleText();
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !finePointer.matches || reducedMotion.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    scheduleText();
  }, { passive: true });
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) releaseText(); });
  window.addEventListener('blur', releaseText);
  window.addEventListener('pointercancel', releaseText);
  window.addEventListener('scroll', () => { measureText(); releaseText(); }, { passive: true });
  window.addEventListener('resize', measureText, { passive: true });
  document.fonts.ready.then(measureText);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { measureText(); releaseText(); return; }
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    pointer = null;
  });
  reducedMotion.addEventListener('change', releaseText);
  finePointer.addEventListener('change', releaseText);
})();
