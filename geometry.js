(() => {
  const canvas = document.getElementById('knot-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const motionButton = document.getElementById('motion-toggle');
  const resetButton = document.getElementById('reset-figure');
  const radiusInput = document.getElementById('tube-radius');
  const radiusOutput = document.getElementById('radius-value');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const segments = 192;
  const sides = 16;
  const vertexCount = segments * sides;
  const edgeCount = vertexCount + (segments / 3) * sides;
  const vertices = new Float32Array(vertexCount * 3);
  const projected = new Float32Array(vertexCount * 3);
  const centers = new Float32Array(segments * 3);
  const normals = new Float32Array(segments * 3);
  const binormals = new Float32Array(segments * 3);
  const edgeStarts = new Uint16Array(edgeCount);
  const edgeEnds = new Uint16Array(edgeCount);
  const edgeDepths = new Uint8Array(edgeCount);
  const ringCosines = new Float32Array(sides);
  const ringSines = new Float32Array(sides);
  const ink = Array.from({ length: 10 }, (_, index) =>
    `rgba(54, 90, 147, ${0.13 + index * 0.065})`
  );
  const initialYaw = -0.32;
  const initialPitch = 0.65;
  const roll = -0.16;
  const rollCosine = Math.cos(roll);
  const rollSine = Math.sin(roll);
  let yaw = initialYaw;
  let pitch = initialPitch;
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let radius = 0.23;
  let playing = !reducedMotion.matches;
  let motionChosen = false;
  let visible = true;
  let frameId = 0;
  let previousTime = 0;
  let contextLost = false;
  let pointer = null;
  let dragging = false;

  const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

  for (let side = 0; side < sides; side += 1) {
    const angle = (side / sides) * Math.PI * 2;
    ringCosines[side] = Math.cos(angle);
    ringSines[side] = Math.sin(angle);
  }

  let edge = 0;
  for (let segment = 0; segment < segments; segment += 1) {
    const t = (segment / segments) * Math.PI * 2;
    const offset = segment * 3;
    centers[offset] = Math.sin(t) + 2 * Math.sin(2 * t);
    centers[offset + 1] = Math.cos(t) - 2 * Math.cos(2 * t);
    centers[offset + 2] = -Math.sin(3 * t);

    const dx = Math.cos(t) + 4 * Math.cos(2 * t);
    const dy = -Math.sin(t) + 4 * Math.sin(2 * t);
    const dz = -3 * Math.cos(3 * t);
    const tangentLength = Math.hypot(dx, dy, dz);
    const tx = dx / tangentLength;
    const ty = dy / tangentLength;
    const tz = dz / tangentLength;
    const ddx = -Math.sin(t) - 8 * Math.sin(2 * t);
    const ddy = -Math.cos(t) + 8 * Math.cos(2 * t);
    const ddz = 9 * Math.sin(3 * t);
    const tangentComponent = ddx * tx + ddy * ty + ddz * tz;
    const nx = ddx - tangentComponent * tx;
    const ny = ddy - tangentComponent * ty;
    const nz = ddz - tangentComponent * tz;
    const normalLength = Math.hypot(nx, ny, nz);
    normals[offset] = nx / normalLength;
    normals[offset + 1] = ny / normalLength;
    normals[offset + 2] = nz / normalLength;
    binormals[offset] = (ty * nz - tz * ny) / normalLength;
    binormals[offset + 1] = (tz * nx - tx * nz) / normalLength;
    binormals[offset + 2] = (tx * ny - ty * nx) / normalLength;

    for (let side = 0; side < sides; side += 1) {
      const vertex = segment * sides + side;
      edgeStarts[edge] = vertex;
      edgeEnds[edge] = ((segment + 1) % segments) * sides + side;
      edge += 1;
      if (segment % 3 === 0) {
        edgeStarts[edge] = vertex;
        edgeEnds[edge] = segment * sides + ((side + 1) % sides);
        edge += 1;
      }
    }
  }

  function updateGeometry() {
    for (let segment = 0; segment < segments; segment += 1) {
      const frameOffset = segment * 3;
      for (let side = 0; side < sides; side += 1) {
        const offset = (segment * sides + side) * 3;
        const cosine = ringCosines[side] * radius;
        const sine = ringSines[side] * radius;
        for (let axis = 0; axis < 3; axis += 1) {
          vertices[offset + axis] = centers[frameOffset + axis]
            + normals[frameOffset + axis] * cosine
            + binormals[frameOffset + axis] * sine;
        }
      }
    }
    if (radiusOutput) radiusOutput.textContent = radius.toFixed(2);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const cosineY = Math.cos(yaw);
    const sineY = Math.sin(yaw);
    const cosineX = Math.cos(pitch);
    const sineX = Math.sin(pitch);
    const scale = Math.min(width, height) * 0.137;

    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
      const offset = vertex * 3;
      const x = vertices[offset];
      const y = vertices[offset + 1];
      const z = vertices[offset + 2];
      const rotatedX = x * cosineY + z * sineY;
      const rotatedZ = z * cosineY - x * sineY;
      const tiltedY = y * cosineX - rotatedZ * sineX;
      const depth = y * sineX + rotatedZ * cosineX;
      const perspective = 9 / (9 + depth);
      projected[offset] = width * 0.5
        + (rotatedX * rollCosine - tiltedY * rollSine) * scale * perspective;
      projected[offset + 1] = height * 0.5
        - (rotatedX * rollSine + tiltedY * rollCosine) * scale * perspective;
      projected[offset + 2] = depth;
    }

    for (let index = 0; index < edgeCount; index += 1) {
      const depth = (projected[edgeStarts[index] * 3 + 2]
        + projected[edgeEnds[index] * 3 + 2]) * 0.5;
      edgeDepths[index] = clamp(Math.floor((3.5 - depth) * (10 / 7)), 0, 9);
    }

    for (let layer = 0; layer < 10; layer += 1) {
      context.beginPath();
      context.strokeStyle = ink[layer];
      context.lineWidth = 0.45 + layer * 0.045;
      for (let index = 0; index < edgeCount; index += 1) {
        if (edgeDepths[index] !== layer) continue;
        const start = edgeStarts[index] * 3;
        const end = edgeEnds[index] * 3;
        context.moveTo(projected[start], projected[start + 1]);
        context.lineTo(projected[end], projected[end + 1]);
      }
      context.stroke();
    }
  }

  function requestDraw() {
    if (frameId || contextLost || !visible || document.hidden || !width || !height) return;
    frameId = window.requestAnimationFrame(animate);
  }

  function animate(time) {
    frameId = 0;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    if (playing && !dragging) yaw += delta * 0.11;
    draw();
    if (playing && !dragging) requestDraw();
  }

  function suspend() {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    previousTime = 0;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    pixelRatio = nextRatio;
    const pixelWidth = Math.round(width * pixelRatio);
    const pixelHeight = Math.round(height * pixelRatio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    requestDraw();
  }

  function updateMotionButton() {
    if (!motionButton) return;
    motionButton.textContent = playing ? 'Pause' : 'Resume';
    motionButton.setAttribute('aria-label', playing ? 'Pause automatic rotation' : 'Resume automatic rotation');
    motionButton.setAttribute('aria-pressed', String(playing));
  }

  function resetOrientation() {
    yaw = initialYaw;
    pitch = initialPitch;
    previousTime = 0;
    requestDraw();
  }

  function finishDrag(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    const id = pointer.id;
    pointer = null;
    dragging = false;
    canvas.style.cursor = 'grab';
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
    previousTime = 0;
    requestDraw();
  }

  canvas.style.touchAction = 'pan-y';
  canvas.style.cursor = 'grab';
  if (!canvas.hasAttribute('tabindex')) canvas.tabIndex = 0;

  canvas.addEventListener('pointerdown', (event) => {
    if (pointer || !event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    if (event.pointerType === 'mouse') {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
      canvas.focus({ preventScroll: true });
    }
  });

  canvas.addEventListener('pointermove', (event) => {
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
      canvas.style.cursor = 'grabbing';
    }
    if (event.cancelable) event.preventDefault();
    yaw += dx * 0.007;
    pitch = clamp(pitch + dy * 0.005, -1.35, 1.35);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    requestDraw();
  });

  window.addEventListener('pointerup', finishDrag);
  canvas.addEventListener('pointercancel', finishDrag);
  canvas.addEventListener('lostpointercapture', finishDrag);
  canvas.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const step = event.shiftKey ? 0.25 : 0.1;
    if (event.key === 'ArrowLeft') yaw -= step;
    else if (event.key === 'ArrowRight') yaw += step;
    else if (event.key === 'ArrowUp') pitch = clamp(pitch - step, -1.35, 1.35);
    else if (event.key === 'ArrowDown') pitch = clamp(pitch + step, -1.35, 1.35);
    else if (event.key === 'Home') resetOrientation();
    else return;
    event.preventDefault();
    requestDraw();
  });

  motionButton?.addEventListener('click', () => {
    playing = !playing;
    motionChosen = true;
    previousTime = 0;
    updateMotionButton();
    requestDraw();
  });

  resetButton?.addEventListener('click', resetOrientation);

  if (radiusInput instanceof HTMLInputElement) {
    radiusInput.min = '0.12';
    radiusInput.max = '0.4';
    radiusInput.step = '0.01';
    radiusInput.value = String(radius);
    radiusInput.addEventListener('input', () => {
      const value = radiusInput.valueAsNumber;
      if (!Number.isFinite(value)) return;
      radius = clamp(value, 0.12, 0.4);
      updateGeometry();
      requestDraw();
    });
  }

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) playing = false;
    else if (!motionChosen) playing = true;
    previousTime = 0;
    updateMotionButton();
    requestDraw();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
    else resize();
  });
  canvas.addEventListener('contextlost', () => {
    contextLost = true;
    suspend();
  });
  canvas.addEventListener('contextrestored', () => {
    contextLost = false;
    resize();
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
    else suspend();
  }).observe(canvas);

  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  updateGeometry();
  updateMotionButton();
  resize();
})();
