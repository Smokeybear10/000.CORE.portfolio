// Dynamic 3D Model System
document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('model-canvas');
  const container = document.getElementById('model-container');

  if (!canvas || !container) return;

  const modelFiles = {
    'projects': 'Models/Projects.glb',
    'experience': 'Models/Experience.glb',
    'about': 'Models/About.glb',
    'contact': 'Models/Contact.glb'
  };

  let currentScene = null;
  let currentRenderer = null;
  let currentCamera = null;
  let currentModel = null;
  let animationId = null;

  window.loadAndShowModel = async function(modelType) {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (currentModel) {
      currentModel.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      currentModel = null;
    }

    if (currentScene) {
      while(currentScene.children.length > 0) {
        currentScene.remove(currentScene.children[0]);
      }
    }

    try {
      const { Scene, PerspectiveCamera, WebGLRenderer, Box3, Vector3, ShaderMaterial } = await import('three');
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');

      if (!currentScene) {
        currentScene = new Scene();
        const w = container.offsetWidth || window.innerWidth;
        const h = container.offsetHeight || window.innerHeight;
        currentCamera = new PerspectiveCamera(75, w / h, 0.1, 1000);
        currentRenderer = new WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        currentRenderer.setSize(w, h);
        currentRenderer.setPixelRatio(window.devicePixelRatio);
        currentRenderer.setClearColor(0x000000, 0);
        currentCamera.position.x = 12;
        currentCamera.position.y = 8;
        currentCamera.position.z = 15;
      }

      const loader = new GLTFLoader();
      const modelFile = modelFiles[modelType] || modelFiles['projects'];

      loader.load(
        modelFile,
        function (gltf) {
          currentModel = gltf.scene;

          const box = new Box3().setFromObject(currentModel);
          const size = box.getSize(new Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const vw = window.innerWidth;
          const targetSize = Math.max(10, Math.min(14, vw / 80));
          const scale = targetSize / maxDim;
          currentModel.scale.setScalar(scale);

          const scaledBox = new Box3().setFromObject(currentModel);
          const scaledCenter = scaledBox.getCenter(new Vector3());
          currentModel.position.sub(scaledCenter);

          currentCamera.position.set(8, 5, 12);
          currentCamera.lookAt(0, 0, 0);

          const faceGlowMaterial = new ShaderMaterial({
            uniforms: {
              time: { value: 0.0 }
            },
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

              vec3 cycleColor(float t) {
                vec3 colorA = vec3(0.92, 0.92, 0.92);
                vec3 colorB = vec3(0.1, 0.8, 0.9);
                vec3 colorC = vec3(0.7, 0.25, 0.85);
                float m = mod(t, 3.0);
                if (m < 1.0) return mix(colorA, colorB, m);
                else if (m < 2.0) return mix(colorB, colorC, m - 1.0);
                else return mix(colorC, colorA, m - 2.0);
              }

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

          currentModel.traverse((child) => {
            if (child.isMesh) {
              child.material = faceGlowMaterial.clone();
            }
          });
          faceGlowMaterial.dispose();

          currentScene.add(currentModel);

          let time = 0;
          function animate() {
            animationId = requestAnimationFrame(animate);
            time += 0.01;

            if (currentModel) {
              currentModel.rotation.y = time;

              currentModel.traverse((child) => {
                if (child.isMesh && child.material.uniforms) {
                  child.material.uniforms.time.value = time;
                }
              });
            }

            currentRenderer.render(currentScene, currentCamera);
          }
          animate();
        },
        undefined,
        function (error) {
          console.error(`Error loading ${modelType} model:`, error);
        }
      );
    } catch (error) {
      console.error('Error in loadAndShowModel:', error);
    }
  };

  window.cleanupDynamicModels = function() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
});
