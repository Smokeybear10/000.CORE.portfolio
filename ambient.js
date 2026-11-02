(() => {
  const canvas = document.querySelector('.ambient-field');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, targetStrength: 0 };
  let width = 0;
  let height = 0;
  let contextLost = false;
  let points = [];
  let frame = 0;
  let previousTime = 0;
  let time = 0;

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#345b83';

    points.forEach(({ x, y, fade }) => {
      const swell = Math.sin(x * 0.021 + y * 0.029 - time);
      const ripple = Math.sin(x * 0.04 - y * 0.019 + time * 0.63);
      const wave = swell * 0.68 + ripple * 0.32;
      const crest = (wave + 1) / 2;
      let dx = 4.5 * Math.sin(y * 0.025 + time * 0.52);
      let dy = 7.5 * wave;
      let highlight = 0;

      if (pointer.strength > 0.001) {
        const vx = pointer.x - x - dx;
        const vy = pointer.y - y - dy;
        const distance = Math.hypot(vx, vy);
        const influence = Math.max(0, 1 - distance / 240);
        const reveal = Math.max(0, 1 - distance / 160);
        highlight = reveal * reveal * (3 - 2 * reveal) * pointer.strength;
        const pull = 0.18 * influence * influence * pointer.strength;
        dx += vx * pull;
        dy += vy * pull;
      }

      const opacity = (0.025 + 0.55 * crest * crest) * fade;
      context.globalAlpha = opacity + (0.8 - opacity) * highlight;
      context.beginPath();
      context.arc(x + dx, y + dy, 0.6 + 0.9 * crest, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
  }

  function animate(now) {
    const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
    time += delta;
    previousTime = now;
    const follow = 1 - Math.exp(-delta * 8);
    pointer.x += (pointer.targetX - pointer.x) * follow;
    pointer.y += (pointer.targetY - pointer.y) * follow;
    pointer.strength += (pointer.targetStrength - pointer.strength) * (1 - Math.exp(-delta * 6));
    draw();
    frame = requestAnimationFrame(animate);
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (contextLost || !width || !height) return;
    if (document.hidden || reducedMotion.matches) {
      pointer.strength = 0;
      pointer.targetStrength = 0;
    }
    draw();
    if (!document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate);
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const mobile = window.innerWidth <= 700;
    const spacing = Math.max(mobile ? 20 : 24, Math.ceil(Math.sqrt(width * height / 3600)));
    const fieldWidth = mobile ? width * 0.88 : Math.min(760, width * 0.74);
    const fieldHeight = mobile ? Math.min(400, height * 0.54) : Math.min(680, height * 0.74);
    const fadeDistance = (fieldWidth + fieldHeight) * 0.72;
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = [];
    for (let y = -spacing; y <= height + spacing; y += spacing) {
      for (let x = -spacing; x <= width + spacing; x += spacing) {
        const distance = Math.min(width - x + y, x + height - y);
        const fade = Math.max(0, Math.min(1, 1 - distance / fadeDistance));
        points.push({ x, y, fade });
      }
    }
    updateMotion();
  }

  function followPointer(event) {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    if (!pointer.targetStrength) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    pointer.targetStrength = 1;
  }

  function releasePointer() {
    pointer.targetStrength = 0;
  }

  window.addEventListener('pointermove', followPointer, { passive: true });
  window.addEventListener('pointerout', event => {
    if (!event.relatedTarget) releasePointer();
  });
  window.addEventListener('pointercancel', releasePointer);
  window.addEventListener('blur', releasePointer);
  canvas.addEventListener('contextlost', () => {
    contextLost = true;
    updateMotion();
  });
  canvas.addEventListener('contextrestored', () => {
    contextLost = false;
    resize();
  });
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) updateMotion();
    else resize();
  });
  reducedMotion.addEventListener('change', updateMotion);
  resize();
})();
