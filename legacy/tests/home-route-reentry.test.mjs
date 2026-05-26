import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const REPO_ROOT = '/Users/thomasou/Github/THOMAS';

class FakeElement {
  constructor({ id = '', textContent = '' } = {}) {
    this.id = id;
    this.textContent = textContent;
    this.style = {};
    this.listeners = new Map();
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }

  listenerCount(type) {
    return this.listeners.get(type)?.size ?? 0;
  }
}

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.bySelector = new Map();
    this.byId = new Map();
    this.body = {
      getAttribute: () => 'home',
    };
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(handler);
  }

  listenerCount(type) {
    return this.listeners.get(type)?.size ?? 0;
  }

  querySelectorAll(selector) {
    return [...(this.bySelector.get(selector) ?? [])];
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  getElementById(id) {
    return this.byId.get(id) ?? null;
  }

  registerSelector(selector, elements) {
    this.bySelector.set(selector, elements);
    elements.forEach((element) => {
      if (element.id) {
        this.byId.set(element.id, element);
      }
    });
  }
}

function createTimerControls() {
  let nextId = 1;
  const timeouts = new Map();
  const canceled = new Set();

  return {
    setTimeout(callback) {
      const id = nextId++;
      timeouts.set(id, callback);
      return id;
    },
    clearTimeout(id) {
      canceled.add(id);
      timeouts.delete(id);
    },
    flushAll() {
      while (timeouts.size > 0) {
        const pending = [...timeouts.values()];
        timeouts.clear();
        pending.forEach((callback) => callback());
      }
    },
    get pendingCount() {
      return timeouts.size;
    },
    get canceledCount() {
      return canceled.size;
    },
  };
}

function createWindowListenerMap() {
  const listeners = new Map();

  return {
    api: {
      devicePixelRatio: 1,
      addEventListener(type, handler) {
        if (!listeners.has(type)) {
          listeners.set(type, new Set());
        }
        listeners.get(type).add(handler);
      },
      removeEventListener(type, handler) {
        listeners.get(type)?.delete(handler);
      },
    },
    count(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

function createThreeStub() {
  class Scene {
    add() {}
  }

  class PerspectiveCamera {
    constructor() {
      this.aspect = 1;
      this.position = { z: 0, y: 0 };
    }

    updateProjectionMatrix() {}
  }

  class WebGLRenderer {
    dispose() {
      this.disposed = true;
    }

    setSize() {}
    setPixelRatio() {}
    setClearColor() {}
    render() {}
  }

  class BoxGeometry {}

  class ShaderMaterial {
    constructor() {
      this.uniforms = { time: { value: 0 } };
    }

    dispose() {
      this.disposed = true;
    }
  }

  class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.rotation = { x: 0, y: 0, z: 0 };
    }
  }

  return { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, Mesh, ShaderMaterial };
}

function loadCubeHarness() {
  const source = readFileSync(`${REPO_ROOT}/js/3d-cube.js`, 'utf8')
    .replace("await import('three')", 'await __importThree()');
  const document = new FakeDocument();
  const cubeCanvas = new FakeElement({ id: 'cube-canvas' });
  const cubeContainer = new FakeElement({ id: 'cube-container' });
  cubeContainer.offsetWidth = 640;
  cubeContainer.offsetHeight = 480;
  document.byId.set('cube-canvas', cubeCanvas);
  document.byId.set('cube-container', cubeContainer);

  const windowListeners = createWindowListenerMap();
  const timers = createTimerControls();
  let nextAnimationFrameId = 1;

  const context = {
    console,
    document,
    window: windowListeners.api,
    __importThree: async () => createThreeStub(),
    requestAnimationFrame: () => nextAnimationFrameId++,
    cancelAnimationFrame() {},
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  };

  vm.runInNewContext(source, context, { filename: `${REPO_ROOT}/js/3d-cube.js` });

  return {
    document,
    window: context.window,
    windowListeners,
    timers,
  };
}

function loadNavigationHarness() {
  const source = readFileSync(`${REPO_ROOT}/js/navigation.js`, 'utf8');
  const document = new FakeDocument();
  const timers = createTimerControls();
  const navLinks = ['home', 'projects', 'experience', 'about', 'contact'].map(
    (text) => new FakeElement({ textContent: text })
  );
  const cubeContainer = new FakeElement({ id: 'cube-container' });
  const modelContainer = new FakeElement({ id: 'model-container' });

  document.registerSelector('.nav-link', navLinks);
  document.byId.set('cube-container', cubeContainer);
  document.byId.set('model-container', modelContainer);

  const windowObject = {
    hideModelTimeout: null,
    currentHoveredModel: null,
    setCubeVisible() {},
    loadAndShowModel() {},
  };

  const context = {
    console,
    document,
    window: windowObject,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  };

  vm.runInNewContext(source, context, { filename: `${REPO_ROOT}/js/navigation.js` });

  return { navLinks, window: windowObject, timers };
}

test('cube cleanup removes resize listener before re-init', async () => {
  const harness = loadCubeHarness();

  assert.equal(harness.document.listenerCount('DOMContentLoaded'), 0);

  await harness.window.init3DCube();
  assert.equal(harness.windowListeners.count('resize'), 1);

  harness.window.cleanup3DCube();
  assert.equal(harness.windowListeners.count('resize'), 0);

  await harness.window.init3DCube();
  assert.equal(harness.windowListeners.count('resize'), 1);
});

test('navigation model cleanup removes hover handlers before re-entry', () => {
  const harness = loadNavigationHarness();

  harness.window.initializeNavigationModels();

  const projectsLink = harness.navLinks.find((link) => link.textContent === 'projects');
  assert.equal(projectsLink.listenerCount('mouseenter'), 1);
  assert.equal(projectsLink.listenerCount('touchstart'), 1);
  assert.equal(projectsLink.listenerCount('mouseleave'), 1);

  harness.window.cleanupNavigationModels();

  assert.equal(projectsLink.listenerCount('mouseenter'), 0);
  assert.equal(projectsLink.listenerCount('touchstart'), 0);
  assert.equal(projectsLink.listenerCount('mouseleave'), 0);

  harness.window.initializeNavigationModels();

  assert.equal(projectsLink.listenerCount('mouseenter'), 1);
  assert.equal(projectsLink.listenerCount('touchstart'), 1);
  assert.equal(projectsLink.listenerCount('mouseleave'), 1);
});
