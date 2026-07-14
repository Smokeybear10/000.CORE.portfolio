(() => {
  const canvas = document.getElementById('attractor-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const context = canvas.getContext('2d');
  if (!context) return;

  const title = document.getElementById('attractor-title');
  const concepts = {
    chaos: {
      title: 'Lorenz attractor',
      accessible: 'Lorenz attractor. Drag or use arrow keys to rotate the trajectory.'
    },
    mobius: {
      title: 'Möbius strip',
      accessible: 'A Möbius strip with one continuous side. Drag or use arrow keys to rotate.'
    },
    klein: {
      title: 'Klein bottle',
      accessible: 'A figure-eight immersion of a Klein bottle in three dimensions, with self-intersections. Drag or use arrow keys to rotate.'
    },
    harmonic: {
      title: 'Spherical harmonic',
      accessible: 'A radial plot of the absolute value of the real spherical harmonic Y three two. Drag or use arrow keys to rotate.'
    },
    topology: {
      title: 'Trefoil knot',
      accessible: 'A trefoil knot drawn as a wire mesh. Drag or use arrow keys to rotate.'
    }
  };
  const conceptNames = Object.keys(concepts);
  const concept = conceptNames[Math.floor(Math.random() * conceptNames.length)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const count = 6500;
  const step = 0.006;
  const points = new Float64Array(count * 3);
  const projected = new Float32Array(count * 2);
  const layers = Array.from({ length: 8 }, () => []);
  const backdrop = document.createElement('canvas');
  const background = backdrop.getContext('2d');
  const lostSurfaces = new Set();
  const initialYaw = 0.42;
  const initialPitch = 0.12;
  const rho = 28;
  let yaw = concept === 'chaos' ? initialYaw : 0.45;
  let pitch = concept === 'chaos' ? initialPitch : 0.65;
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

    const scale = Math.min((width - 36) / Math.max(maxX - minX, 0.001), (height - 52) / Math.max(maxY - minY, 0.001));
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

  function drawChaos() {
    if (dirty) renderBackground();
    context.clearRect(0, 0, width, height);
    context.drawImage(backdrop, 0, 0, width, height);
    const head = Math.floor(phase) % count;
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
    context.globalAlpha = 1;
  }

  const surfaces = {};

  function buildSurface(name) {
    const rows = name === 'mobius' ? 120 : name === 'klein' ? 96 : 64;
    const columns = name === 'mobius' ? 14 : name === 'klein' ? 28 : 40;
    const periodicV = name === 'klein';
    const stride = periodicV ? columns : columns + 1;
    const vertices = new Float64Array(rows * stride * 3);
    const faces = [];
    const minimum = [Infinity, Infinity, Infinity];
    const maximum = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < rows; i += 1) {
      const u = i / rows * Math.PI * 2;
      for (let j = 0; j < stride; j += 1) {
        let point;
        if (name === 'mobius') {
          const v = (j / columns * 2 - 1) * 0.38;
          const radial = 1 + v * Math.cos(u / 2);
          point = [radial * Math.cos(u), radial * Math.sin(u), v * Math.sin(u / 2)];
        } else if (name === 'klein') {
          const v = j / columns * Math.PI * 2;
          const radial = 2 + Math.cos(u / 2) * Math.sin(v) - Math.sin(u / 2) * Math.sin(2 * v);
          point = [radial * Math.cos(u), radial * Math.sin(u), Math.sin(u / 2) * Math.sin(v) + Math.cos(u / 2) * Math.sin(2 * v)];
        } else {
          const theta = j / columns * Math.PI;
          const sine = Math.sin(theta);
          const harmonic = Math.sqrt(105 / Math.PI) / 4 * sine * sine * Math.cos(theta) * Math.cos(2 * u);
          const radius = Math.abs(harmonic);
          point = [radius * sine * Math.cos(u), radius * sine * Math.sin(u), radius * Math.cos(theta)];
        }
        for (let axis = 0; axis < 3; axis += 1) {
          vertices[(i * stride + j) * 3 + axis] = point[axis];
          minimum[axis] = Math.min(minimum[axis], point[axis]);
          maximum[axis] = Math.max(maximum[axis], point[axis]);
        }
      }
    }
    const center = minimum.map((value, axis) => (value + maximum[axis]) / 2);
    let radius = 0;
    for (let i = 0; i < vertices.length; i += 3) {
      for (let axis = 0; axis < 3; axis += 1) vertices[i + axis] -= center[axis];
      radius = Math.max(radius, Math.hypot(vertices[i], vertices[i + 1], vertices[i + 2]));
    }
    for (let i = 0; i < vertices.length; i += 1) vertices[i] /= radius;
    for (let i = 0; i < rows; i += 1) {
      const nextI = (i + 1) % rows;
      for (let j = 0; j < columns; j += 1) {
        const nextJ = periodicV ? (j + 1) % columns : j + 1;
        let seamJ = j;
        let seamNextJ = nextJ;
        if (nextI === 0 && name === 'mobius') {
          seamJ = columns - j;
          seamNextJ = columns - nextJ;
        } else if (nextI === 0 && name === 'klein') {
          seamJ = (columns - j) % columns;
          seamNextJ = (columns - nextJ) % columns;
        }
        faces.push({ indices: [i * stride + j, nextI * stride + seamJ, nextI * stride + seamNextJ, i * stride + nextJ], depth: 0 });
      }
    }
    return { vertices, faces, projected: new Float32Array(vertices.length) };
  }

  function drawSurface() {
    const mesh = surfaces[concept] ??= buildSurface(concept);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const scale = Math.min(width - 36, height - 40) / 2;
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < mesh.vertices.length; i += 3) {
      const x = mesh.vertices[i];
      const y = mesh.vertices[i + 1];
      const z = mesh.vertices[i + 2];
      const horizontal = x * cy + y * sy;
      const depth = y * cy - x * sy;
      mesh.projected[i] = width / 2 + horizontal * scale;
      mesh.projected[i + 1] = height * 0.47 - (z * cp - depth * sp) * scale;
      mesh.projected[i + 2] = depth * cp + z * sp;
    }
    for (const face of mesh.faces) {
      const [a, b, c, d] = face.indices;
      face.depth = (mesh.projected[a * 3 + 2] + mesh.projected[b * 3 + 2] + mesh.projected[c * 3 + 2] + mesh.projected[d * 3 + 2]) / 4;
    }
    mesh.faces.sort((a, b) => a.depth - b.depth);
    context.lineWidth = 0.55;
    context.fillStyle = '#fafaf8';
    for (const face of mesh.faces) {
      context.beginPath();
      for (let corner = 0; corner < 4; corner += 1) {
        const index = face.indices[corner] * 3;
        if (corner === 0) context.moveTo(mesh.projected[index], mesh.projected[index + 1]);
        else context.lineTo(mesh.projected[index], mesh.projected[index + 1]);
      }
      context.closePath();
      context.fill();
      context.strokeStyle = `rgba(39, 75, 114, ${0.25 + (face.depth + 1) * 0.125})`;
      context.stroke();
    }
  }

  const knotSegments = 200;
  const knotSides = 10;
  const knotRadius = 0.18;
  let knotPoints = [];

  function buildKnot() {
    knotPoints = Array.from({ length: knotSegments }, (_, i) => {
      const t = i / knotSegments * Math.PI * 2;
      const c2 = Math.cos(2 * t);
      const s2 = Math.sin(2 * t);
      const c3 = Math.cos(3 * t);
      const s3 = Math.sin(3 * t);
      const center = [(2 + c3) * c2, (2 + c3) * s2, s3];
      const tangent = [-3 * s3 * c2 - 2 * (2 + c3) * s2, -3 * s3 * s2 + 2 * (2 + c3) * c2, 3 * c3];
      const length = Math.hypot(...tangent);
      const [tx, ty, tz] = tangent.map(value => value / length);
      const normal = [c3 * c2, c3 * s2, s3];
      const binormal = [ty * normal[2] - tz * normal[1], tz * normal[0] - tx * normal[2], tx * normal[1] - ty * normal[0]];
      return Array.from({ length: knotSides }, (_, j) => {
        const a = j / knotSides * Math.PI * 2;
        return center.map((value, axis) => value + knotRadius * (Math.cos(a) * normal[axis] + Math.sin(a) * binormal[axis]));
      });
    });
  }

  function drawKnot() {
    if (!knotPoints.length) buildKnot();
    context.clearRect(0, 0, width, height);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const scale = Math.min((width - 38) / 6.5, (height - 40) / 6.7);
    const vertices = knotPoints.map(ring => ring.map(([x, y, z]) => {
      const horizontal = x * cy + y * sy;
      const depth = y * cy - x * sy;
      return [width / 2 + horizontal * scale, height * 0.47 - (z * cp - depth * sp) * scale, depth * cp + z * sp];
    }));
    const faces = [];
    for (let i = 0; i < knotSegments; i += 1) {
      for (let j = 0; j < knotSides; j += 1) {
        const nextI = (i + 1) % knotSegments;
        const nextJ = (j + 1) % knotSides;
        const corners = [vertices[i][j], vertices[nextI][j], vertices[nextI][nextJ], vertices[i][nextJ]];
        faces.push({ corners, depth: corners.reduce((sum, point) => sum + point[2], 0) / 4 });
      }
    }
    faces.sort((a, b) => a.depth - b.depth);
    context.lineWidth = 0.55;
    for (const { corners, depth } of faces) {
      context.beginPath();
      corners.forEach(([x, y], i) => i === 0 ? context.moveTo(x, y) : context.lineTo(x, y));
      context.closePath();
      context.fillStyle = '#fafaf8';
      context.fill();
      context.strokeStyle = `rgba(39, 75, 114, ${0.25 + (depth + 3.3) / 6.6 * 0.25})`;
      context.stroke();
    }
  }

  function requestDraw() {
    if (frame || lostSurfaces.size || !visible || document.hidden || !width || !height) return;
    frame = requestAnimationFrame(animate);
  }

  function animate(time) {
    frame = 0;
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
    previousTime = time;
    if (playing && !dragging) {
      phase = (phase + delta * 95) % count;
      if (concept !== 'chaos') yaw += delta * 0.12;
    }
    if (concept === 'chaos') drawChaos();
    else if (concept === 'topology') drawKnot();
    else drawSurface();
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
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    for (const surface of [canvas, backdrop]) {
      if (surface.width !== pixelWidth) surface.width = pixelWidth;
      if (surface.height !== pixelHeight) surface.height = pixelHeight;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    background.setTransform(ratio, 0, 0, ratio, 0, 0);
    dirty = true;
    requestDraw();
  }

  function updateMotion() {
    canvas.setAttribute('aria-label', `${concepts[concept].accessible} Press Space to ${playing ? 'pause' : 'play'} the animation.`);
  }

  function toggleMotion() {
    playing = !playing;
    motionChosen = true;
    previousTime = 0;
    updateMotion();
    requestDraw();
  }

  function resetView() {
    yaw = concept === 'chaos' ? initialYaw : 0.45;
    pitch = concept === 'chaos' ? initialPitch : 0.65;
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
    if (event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) toggleMotion();
      return;
    }
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
  reducedMotion.addEventListener('change', event => {
    if (event.matches) playing = false;
    else if (!motionChosen) playing = true;
    updateMotion();
    previousTime = 0;
    requestDraw();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
    else resize();
  });
  for (const surface of [canvas, backdrop]) {
    surface.addEventListener('contextlost', () => {
      lostSurfaces.add(surface);
      suspend();
    });
    surface.addEventListener('contextrestored', () => {
      lostSurfaces.delete(surface);
      resize();
    });
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestDraw();
    else suspend();
  }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  integrate();
  title.textContent = concepts[concept].title;
  canvas.dataset.concept = concept;
  updateMotion();
  resize();
})();
