// 3D Cube Setup
let cubeScene, cubeCamera, cubeRenderer, cube, cubeMaterial;
let cubeAnimationId;
let isCubeInitialized = false;
let cubeResizeHandler = null;
let cubeTime = 0;
let isCubeVisible = true;
let cubePaused = false;

// Drag state
let cubeDragging = false;
let cubeDragX = 0;
let cubeDragY = 0;
let cubeUserRotX = 0;
let cubeUserRotY = 0;
let cubeVelX = 0;
let cubeVelY = 0;
let cubeInteractionCleanup = [];

const COLOR_SHADER = `
  vec3 cycleColor(float t) {
    vec3 colorA = vec3(0.92, 0.92, 0.92);
    vec3 colorB = vec3(0.1, 0.8, 0.9);
    vec3 colorC = vec3(0.7, 0.25, 0.85);

    float m = mod(t, 3.0);
    if (m < 1.0) return mix(colorA, colorB, m);
    else if (m < 2.0) return mix(colorB, colorC, m - 1.0);
    else return mix(colorC, colorA, m - 2.0);
  }
`;

function startCubeLoop() {
  if (cubeAnimationId) return;
  function animateCube() {
    cubeAnimationId = requestAnimationFrame(animateCube);
    if (cubePaused) return;

    if (isCubeVisible && cube && cubeMaterial) {
      cubeMaterial.uniforms.time.value = cubeTime;

      if (cubeDragging) {
        cube.rotation.x = cubeUserRotX;
        cube.rotation.y = cubeUserRotY;
      } else {
        // Apply momentum
        cubeUserRotX += cubeVelX;
        cubeUserRotY += cubeVelY;
        cubeVelX *= 0.96;
        cubeVelY *= 0.96;

        // Blend back to auto-rotation when momentum dies
        const momentum = Math.abs(cubeVelX) + Math.abs(cubeVelY);
        if (momentum < 0.001) {
          cubeTime += 0.02;
          const autoX = cubeTime * 0.5;
          const autoY = cubeTime * 0.8;
          cubeUserRotX += (autoX - cubeUserRotX) * 0.02;
          cubeUserRotY += (autoY - cubeUserRotY) * 0.02;
        } else {
          cubeTime += 0.02;
        }

        cube.rotation.x = cubeUserRotX;
        cube.rotation.y = cubeUserRotY;
      }

      cube.rotation.z = cubeTime * 0.3;
    }

    if (cubeRenderer && cubeScene && cubeCamera) {
      cubeRenderer.render(cubeScene, cubeCamera);
    }
  }
  animateCube();
}

function setupCubeInteraction(canvas) {
  cubeInteractionCleanup.forEach(fn => fn());
  cubeInteractionCleanup = [];

  const container = canvas.parentElement;
  if (!container) return;

  let hitArea = container.querySelector('.cube-hit-area');
  if (!hitArea) {
    hitArea = document.createElement('div');
    hitArea.className = 'cube-hit-area';
    hitArea.style.cssText = 'position:absolute;top:50%;left:50%;width:280px;height:280px;transform:translate(-50%,-50%);pointer-events:auto;cursor:grab;z-index:51;';
    container.appendChild(hitArea);
  }

  function onDown(e) {
    cubeDragging = true;
    hitArea.style.cursor = 'grabbing';
    const pos = e.touches ? e.touches[0] : e;
    cubeDragX = pos.clientX;
    cubeDragY = pos.clientY;
    cubeVelX = 0;
    cubeVelY = 0;
    if (e.touches) e.preventDefault();
  }

  function onMove(e) {
    if (!cubeDragging) return;
    const pos = e.touches ? e.touches[0] : e;
    const dx = pos.clientX - cubeDragX;
    const dy = pos.clientY - cubeDragY;

    cubeVelX = dy * 0.01;
    cubeVelY = -dx * 0.01;
    cubeUserRotX += dy * 0.01;
    cubeUserRotY += -dx * 0.01;

    cubeDragX = pos.clientX;
    cubeDragY = pos.clientY;
    if (e.touches) e.preventDefault();
  }

  function onUp() {
    if (!cubeDragging) return;
    cubeDragging = false;
    hitArea.style.cursor = 'grab';
  }

  hitArea.addEventListener('mousedown', onDown);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
  hitArea.addEventListener('touchstart', onDown, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onUp);

  cubeInteractionCleanup.push(
    () => hitArea.removeEventListener('mousedown', onDown),
    () => document.removeEventListener('mousemove', onMove),
    () => document.removeEventListener('mouseup', onUp),
    () => hitArea.removeEventListener('touchstart', onDown),
    () => document.removeEventListener('touchmove', onMove),
    () => document.removeEventListener('touchend', onUp)
  );
}

async function initializeCube() {
  const cubeCanvas = document.getElementById('cube-canvas');
  const cubeContainer = document.getElementById('cube-container');
  if (!cubeCanvas || !cubeContainer) return;

  try {
    const { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, Mesh, ShaderMaterial } = await import('three');

    cubeScene = new Scene();
    cubeCamera = new PerspectiveCamera(75, cubeContainer.offsetWidth / cubeContainer.offsetHeight || 1, 0.1, 1000);
    cubeRenderer = new WebGLRenderer({ canvas: cubeCanvas, alpha: true, antialias: true });

    cubeRenderer.setSize(cubeContainer.offsetWidth || window.innerWidth, cubeContainer.offsetHeight || window.innerHeight);
    cubeRenderer.setPixelRatio(window.devicePixelRatio);
    cubeRenderer.setClearColor(0x000000, 0);

    cubeMaterial = new ShaderMaterial({
      uniforms: { time: { value: 0.0 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        ${COLOR_SHADER}
        void main() {
          float speed = 0.4;
          vec3 color = cycleColor(time * speed);
          if (abs(vNormal.x) > 0.9) color = cycleColor(time * speed + 1.0);
          else if (abs(vNormal.y) > 0.9) color = cycleColor(time * speed + 2.0);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false
    });

    const cubeGeometry = new BoxGeometry(3.6, 3.6, 3.6);
    cube = new Mesh(cubeGeometry, cubeMaterial);
    cubeScene.add(cube);

    cubeCamera.position.z = 8.5;
    cubeCamera.position.y = 0;

    window.setCubeVisible = function(visible) {
      isCubeVisible = visible;
    };

    cubeResizeHandler = () => {
      if (cubeCamera && cubeRenderer && cubeContainer) {
        const w = cubeContainer.offsetWidth || window.innerWidth;
        const h = cubeContainer.offsetHeight || window.innerHeight;
        cubeCamera.aspect = w / h;
        cubeCamera.updateProjectionMatrix();
        cubeRenderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', cubeResizeHandler);

    setupCubeInteraction(cubeCanvas);

    isCubeInitialized = true;
    cubePaused = false;
    startCubeLoop();

  } catch (error) {
    console.error('Error initializing cube scene:', error);
  }
}

window.init3DCube = async function() {
  if (!isCubeInitialized) {
    await initializeCube();
  } else {
    cubePaused = false;
    startCubeLoop();
    if (cubeResizeHandler) cubeResizeHandler();
  }
};

window.cleanup3DCube = function() {
  cubePaused = true;
  cubeDragging = false;
  if (cubeAnimationId) {
    cancelAnimationFrame(cubeAnimationId);
    cubeAnimationId = null;
  }
};
