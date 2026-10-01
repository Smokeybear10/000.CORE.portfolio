(() => {
  const canvas = document.querySelector('.ambient-field');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, targetStrength: 0 };
  let width = 0;
  let height = 0;
  let pixelRatio = 0;
  let mobileLayout = false;
  let resizePending = true;
  let contextLost = false;
  let points = [];
  let contours = [];
  const angles = Array.from({ length: 97 }, (_, index) => {
    const angle = index / 96 * Math.PI * 2;
    return { angle, cos: Math.cos(angle), sin: Math.sin(angle) };
  });
  let frame = 0;
  let previousTime = 0;
  let time = 0;

  function drawContours() {
    context.lineWidth = mobileLayout ? 0.75 : 0.85;
    contours.forEach(({ x, y, radius, scale, phase, ink, alpha }) => {
      context.strokeStyle = ink;
      context.globalAlpha = alpha;
      context.beginPath();
      angles.forEach(({ angle, cos, sin }, index) => {
        const swell = 1 + 0.065 * Math.sin(angle * 3 + time * 0.21 + phase)
          + 0.035 * Math.cos(angle * 2 - time * 0.16 + phase);
        let px = x + radius * swell * cos + 9 * Math.sin(time * 0.17 + phase);
        let py = y + radius * swell * sin * scale + 12 * Math.cos(time * 0.13 + phase);
        if (pointer.strength > 0.001) {
          const dx = pointer.x - px;
          const dy = pointer.y - py;
          const distance = Math.hypot(dx, dy);
          const influence = Math.max(0, 1 - distance / 260) ** 3 * pointer.strength;
          px += dx * influence * 0.28;
          py += dy * influence * 0.28;
        }
        if (index === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      });
      context.closePath();
      context.stroke();
    });
    context.globalAlpha = 1;
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    drawContours();
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
      context.globalAlpha = (opacity + (0.8 - opacity) * highlight) * 0.42;
      context.beginPath();
      context.arc(x + dx, y + dy, 0.6 + 0.9 * crest, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
  }

  function requestFrame() {
    if (!frame && !document.hidden && !contextLost) frame = requestAnimationFrame(animate);
  }

  function animate(now) {
    frame = 0;
    if (document.hidden || contextLost) return;
    if (resizePending) {
      resizePending = false;
      resize();
    }
    if (!width || !height) {
      previousTime = 0;
      return;
    }
    if (!reducedMotion.matches) {
      const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 0;
      time += delta;
      previousTime = now;
      const follow = 1 - Math.exp(-delta * 8);
      pointer.x += (pointer.targetX - pointer.x) * follow;
      pointer.y += (pointer.targetY - pointer.y) * follow;
      pointer.strength += (pointer.targetStrength - pointer.strength) * (1 - Math.exp(-delta * 6));
    }
    draw();
    if (!reducedMotion.matches) requestFrame();
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (document.hidden || reducedMotion.matches) {
      pointer.strength = 0;
      pointer.targetStrength = 0;
    }
    requestFrame();
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const nextWidth = Math.round(bounds.width);
    const nextHeight = Math.round(bounds.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(6000000 / Math.max(1, nextWidth * nextHeight)));
    const mobile = window.innerWidth <= 760;
    if (nextWidth === width && nextHeight === height && ratio === pixelRatio && mobile === mobileLayout) return;
    width = nextWidth;
    height = nextHeight;
    pixelRatio = ratio;
    mobileLayout = mobile;
    if (!width || !height) return;
    let spacing = Math.max(mobile ? 20 : 24, Math.ceil(Math.sqrt(width * height / 3600)));
    while ((Math.floor(width / spacing) + 3) * (Math.floor(height / spacing) + 3) > 3600) spacing += 1;
    const fieldWidth = mobile ? width * 0.88 : Math.min(760, width * 0.74);
    const fieldHeight = mobile ? Math.min(400, height * 0.54) : Math.min(680, height * 0.74);
    const fadeDistance = (fieldWidth + fieldHeight) * 0.72;
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    contours = [];
    const fields = [
      { x: width + 32, y: height * 0.22, size: Math.min(510, width * 0.52 + 90), scale: 0.86, phase: 0, side: 1 },
      { x: -96, y: height * 0.88, size: Math.min(420, width * 0.4 + 80), scale: 0.8, phase: 1.6, side: -1 },
    ];
    fields.forEach(field => {
      const ink = context.createLinearGradient(field.x - field.size, 0, field.x + field.size, 0);
      if (field.side === 1) {
        ink.addColorStop(0, '#345b8300');
        ink.addColorStop(0.24, '#345b8370');
        ink.addColorStop(0.75, '#345b83');
      } else {
        ink.addColorStop(0.25, '#345b83');
        ink.addColorStop(0.76, '#345b8370');
        ink.addColorStop(1, '#345b8300');
      }
      const count = mobile ? 16 : 23;
      for (let index = 0; index < count; index += 1) {
        const progress = index / (count - 1);
        contours.push({
          x: field.x, y: field.y, scale: field.scale, ink,
          radius: field.size * (0.36 + progress * 0.64),
          phase: field.phase + progress * 0.3,
          alpha: 0.17 + 0.1 * Math.sin(progress * Math.PI),
        });
      }
    });
    points = [];
    for (let y = -spacing; y <= height + spacing; y += spacing) {
      for (let x = -spacing; x <= width + spacing; x += spacing) {
        const distance = Math.min(width - x + y, x + height - y);
        const fade = Math.max(0, Math.min(1, 1 - distance / fadeDistance));
        points.push({ x, y, fade });
      }
    }
  }

  function requestResize() {
    resizePending = true;
    requestFrame();
  }

  function followPointer(event) {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    if (pointer.strength < 0.001) {
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
    pixelRatio = 0;
    requestResize();
  });
  new ResizeObserver(requestResize).observe(canvas);
  window.addEventListener('resize', requestResize, { passive: true });
  window.visualViewport?.addEventListener('resize', requestResize, { passive: true });
  window.addEventListener('pageshow', requestResize);
  document.addEventListener('visibilitychange', () => {
    resizePending = true;
    updateMotion();
  });
  reducedMotion.addEventListener('change', updateMotion);
  requestFrame();
})();
