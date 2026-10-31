(() => {
  const canvas = document.getElementById('attractor-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const rhoInput = document.getElementById('attractor-rho');
  const rhoOutput = document.getElementById('rho-value');
  const motionButton = document.getElementById('attractor-motion');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const count = 18000;
  const step = 0.006;
  const points = new Float64Array(count * 3);
  const projected = new Float32Array(count * 2);
  const layers = Array.from({ length: 8 }, () => []);
  const backdrop = document.createElement('canvas');
  const background = backdrop.getContext('2d');
  const initialYaw = 0.42;
  const initialPitch = 0.12;
  let rho = 28;
  let yaw = initialYaw;
  let pitch = initialPitch;
  let width = 0;
  let height = 0;
  let ratio = 1;
  let phase = 4200;
  let frame = 0;
  let previousTime = 0;
  let dirty = true;
  let visible = true;
  let playing = !reducedMotion.matches;
  let motionChosen = false;
  let pointer = null;
  let dragging = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function derivative(x, y, z) {
    return [10 * (y - x), x * (rho - z) - y, x * y - (8 / 3) * z];
  }

  function integrate() {
    let x = 0.1;
    let y = 0;
    let z = 0;
    for (let i = -1500; i < count; i += 1) {
      const a = derivative(x, y, z);
      const b = derivative(x + a[0] * step / 2, y + a[1] * step / 2, z + a[2] * step / 2);
      const c = derivative(x + b[0] * step / 2, y + b[1] * step / 2, z + b[2] * step / 2);
      const d = derivative(x + c[0] * step, y + c[1] * step, z + c[2] * step);
      x += step * (a[0] + 2 * b[0] + 2 * c[0] + d[0]) / 6;
      y += step * (a[1] + 2 * b[1] + 2 * c[1] + d[1]) / 6;
      z += step * (a[2] + 2 * b[2] + 2 * c[2] + d[2]) / 6;
      if (i < 0) continue;
      points[i * 3] = x;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = z;
    }
    dirty = true;
  }

  function renderBackground() {
    background.clearRect(0, 0, width, height);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const roll = -0.14;
    const cr = Math.cos(roll);
    const sr = Math.sin(roll);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    layers.forEach(layer => { layer.length = 0; });

    for (let i = 0; i < count; i += 1) {
      const x = points[i * 3];
      const y = points[i * 3 + 1];
      const z = points[i * 3 + 2] - rho + 2;
      const horizontal = x * cy + y * sy;
      const depth = y * cy - x * sy;
      const vertical = z * cp - depth * sp;
      const px = horizontal * cr - vertical * sr;
      const py = -(horizontal * sr + vertical * cr);
      projected[i * 2] = px;
      projected[i * 2 + 1] = py;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
      if (i > 0) layers[clamp(Math.floor((depth + 30) / 7.5), 0, 7)].push(i);
    }

    const scale = Math.min((width - 36) / (maxX - minX), (height - 52) / (maxY - minY));
    for (let i = 0; i < count; i += 1) {
      projected[i * 2] = width / 2 + (projected[i * 2] - (minX + maxX) / 2) * scale;
      projected[i * 2 + 1] = height * 0.47 + (projected[i * 2 + 1] - (minY + maxY) / 2) * scale;
    }

    layers.forEach((layer, index) => {
      background.beginPath();
      background.strokeStyle = `rgba(39, 75, 114, ${0.22 + index * 0.035})`;
      background.lineWidth = 0.7;
      for (const i of layer) {
        background.moveTo(projected[(i - 1) * 2], projected[(i - 1) * 2 + 1]);
        background.lineTo(projected[i * 2], projected[i * 2 + 1]);
      }
      background.stroke();
    });
    dirty = false;
  }

  function draw() {
    if (dirty) renderBackground();
    context.clearRect(0, 0, width, height);
    context.drawImage(backdrop, 0, 0, width, height);
    for (let tracer = 0; tracer < 4; tracer += 1) {
      const head = (Math.floor(phase) + tracer * 4103) % count;
      context.globalAlpha = Math.min(head / 80, (count - 1 - head) / 80, 1);
      for (let section = 0; section < 8; section += 1) {
        context.beginPath();
        context.strokeStyle = `rgba(30, 68, 111, ${0.12 + section * 0.1})`;
        context.lineWidth = 0.85;
        const start = head - (8 - section) * 10;
        for (let j = 0; j <= 10; j += 1) {
          const i = start + j;
          if (i < 0) continue;
          if (j === 0 || i === 0) context.moveTo(projected[i * 2], projected[i * 2 + 1]);
          else context.lineTo(projected[i * 2], projected[i * 2 + 1]);
        }
        context.stroke();
      }
      context.beginPath();
      context.arc(projected[head * 2], projected[head * 2 + 1], 2.1, 0, Math.PI * 2);
      context.fillStyle = '#244f7b';
      context.fill();
    }
    context.globalAlpha = 1;
  }

  function requestDraw() {
    if (frame || !visible || document.hidden || !width || !height) return;
    frame = requestAnimationFrame(animate);
  }

  function animate(time) {
    frame = 0;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    if (playing && !dragging) phase = (phase + delta * 95) % count;
    draw();
    if (playing && !dragging) requestDraw();
  }

  function suspend() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    for (const surface of [canvas, backdrop]) {
      surface.width = Math.round(width * ratio);
      surface.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    background.setTransform(ratio, 0, 0, ratio, 0, 0);
    dirty = true;
    requestDraw();
  }

  function updateMotion() {
    motionButton.textContent = playing ? 'Pause' : 'Play';
    motionButton.setAttribute('aria-pressed', String(playing));
    motionButton.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} attractor animation`);
  }

  function resetView() {
    yaw = initialYaw;
    pitch = initialPitch;
    dirty = true;
    requestDraw();
  }

  function endDrag(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    const id = pointer.id;
    pointer = null;
    dragging = false;
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    previousTime = 0;
    requestDraw();
  }

  canvas.addEventListener('pointerdown', event => {
    if (pointer || !event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    if (event.pointerType === 'mouse') {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
      canvas.focus({ preventScroll: true });
    }
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    if (!dragging) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        pointer = null;
        return;
      }
      if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy) * 1.1) return;
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
    }
    if (event.cancelable) event.preventDefault();
    yaw += dx * 0.008;
    pitch = clamp(pitch + dy * 0.006, -1.4, 1.4);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    dirty = true;
    requestDraw();
  });
  window.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('lostpointercapture', endDrag);
  canvas.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'ArrowLeft') yaw -= 0.12;
    else if (event.key === 'ArrowRight') yaw += 0.12;
    else if (event.key === 'ArrowUp') pitch = clamp(pitch - 0.12, -1.4, 1.4);
    else if (event.key === 'ArrowDown') pitch = clamp(pitch + 0.12, -1.4, 1.4);
    else if (event.key === 'Home') resetView();
    else return;
    event.preventDefault();
    dirty = true;
    requestDraw();
  });
  rhoInput.addEventListener('input', () => {
    rho = rhoInput.valueAsNumber;
    rhoOutput.value = rho.toFixed(1);
    integrate();
    requestDraw();
  });
  motionButton.addEventListener('click', () => {
    playing = !playing;
    motionChosen = true;
    previousTime = 0;
    updateMotion();
    requestDraw();
  });
  document.getElementById('attractor-reset').addEventListener('click', () => {
    rho = 28;
    rhoInput.value = '28';
    rhoOutput.value = '28.0';
    phase = 4200;
    integrate();
    resetView();
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) playing = false;
    else if (!motionChosen) playing = true;
    updateMotion();
    previousTime = 0;
    requestDraw();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
    else requestDraw();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
    else suspend();
  }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  integrate();
  updateMotion();
  resize();
})();
