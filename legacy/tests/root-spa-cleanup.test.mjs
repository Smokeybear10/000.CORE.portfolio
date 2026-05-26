import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const REPO_ROOT = '/Users/thomasou/Github/THOMAS';

class FakeClassList {
  constructor() {
    this.classes = new Set();
  }

  add(...names) {
    names.forEach((name) => this.classes.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.classes.delete(name));
  }

  contains(name) {
    return this.classes.has(name);
  }

  toggle(name, force) {
    if (force === true) {
      this.classes.add(name);
      return true;
    }

    if (force === false) {
      this.classes.delete(name);
      return false;
    }

    if (this.classes.has(name)) {
      this.classes.delete(name);
      return false;
    }

    this.classes.add(name);
    return true;
  }
}

class FakeElement {
  constructor(tagName, ownerDocument, options = {}) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.id = options.id ?? '';
    this.dataset = { ...(options.dataset ?? {}) };
    this.style = {};
    this.children = [];
    this.parentNode = null;
    this.listeners = new Map();
    this.className = options.className ?? '';
    this.classList = new FakeClassList();
    this.textContent = options.textContent ?? '';
    this.innerHTML = options.innerHTML ?? '';
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

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    this.ownerDocument._trackElement(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parentNode = null;
      this.ownerDocument._untrackElement(child);
    }
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  querySelectorAll(selector) {
    return this.ownerDocument._queryWithin(this, selector);
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  closest() {
    return null;
  }
}

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.elementsById = new Map();
    this.selectorMap = new Map();
    this.allElements = new Set();
    this.head = new FakeElement('head', this, { id: 'head' });
    this.body = new FakeElement('body', this, { id: 'body' });
    this._trackElement(this.head);
    this._trackElement(this.body);
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  getElementById(id) {
    return this.elementsById.get(id) ?? null;
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

  querySelectorAll(selector) {
    return [...(this.selectorMap.get(selector) ?? [])];
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  register(selector, elements) {
    this.selectorMap.set(selector, elements);
    elements.forEach((element) => this._trackElement(element));
  }

  _trackElement(element) {
    this.allElements.add(element);
    if (element.id) {
      this.elementsById.set(element.id, element);
    }
  }

  _untrackElement(element) {
    this.allElements.delete(element);
    if (element.id && this.elementsById.get(element.id) === element) {
      this.elementsById.delete(element.id);
    }
  }

  _queryWithin(root, selector) {
    if (selector === '.falling-model') {
      return root.children.filter((child) => child.className === 'falling-model');
    }

    if (selector === '.project-section.image-section' || selector === '.section-dot') {
      return [];
    }

    return [];
  }
}

function createTimerControls() {
  let nextId = 1;
  const timeouts = new Map();
  const intervals = new Map();
  const canceledTimeouts = new Set();
  const canceledIntervals = new Set();

  return {
    setTimeout(callback) {
      const id = nextId++;
      timeouts.set(id, callback);
      return id;
    },
    clearTimeout(id) {
      canceledTimeouts.add(id);
      timeouts.delete(id);
    },
    setInterval(callback) {
      const id = nextId++;
      intervals.set(id, callback);
      return id;
    },
    clearInterval(id) {
      canceledIntervals.add(id);
      intervals.delete(id);
    },
    flushNextTimeoutBatch() {
      if (timeouts.size === 0) {
        return;
      }

      const pending = [...timeouts.entries()];
      timeouts.clear();
      pending.forEach(([, callback]) => callback());
    },
    get pendingTimeoutCount() {
      return timeouts.size;
    },
    get pendingIntervalCount() {
      return intervals.size;
    },
    get canceledTimeoutCount() {
      return canceledTimeouts.size;
    },
    get canceledIntervalCount() {
      return canceledIntervals.size;
    },
  };
}

function createAnimationFrameControls() {
  let nextId = 1;
  const pending = new Set();
  const canceled = new Set();

  return {
    requestAnimationFrame() {
      const id = nextId++;
      pending.add(id);
      return id;
    },
    cancelAnimationFrame(id) {
      pending.delete(id);
      canceled.add(id);
    },
    get pendingCount() {
      return pending.size;
    },
    get canceledCount() {
      return canceled.size;
    },
  };
}

function createThreeStub() {
  class Disposable {
    constructor() {
      this.disposed = false;
    }

    dispose() {
      this.disposed = true;
    }
  }

  class Scene {
    add() {}
  }

  class PerspectiveCamera {
    constructor() {
      this.position = { z: 0 };
    }
  }

  class WebGLRenderer extends Disposable {
    constructor() {
      super();
      this.contextLost = false;
    }

    setSize() {}
    render() {}

    getContext() {
      return {
        getExtension: () => ({
          loseContext: () => {
            this.contextLost = true;
          },
        }),
      };
    }
  }

  class AmbientLight {}
  class DirectionalLight {
    constructor() {
      this.position = { set() {} };
    }
  }

  class MeshPhongMaterial extends Disposable {}
  class BoxGeometry extends Disposable {}
  class OctahedronGeometry extends Disposable {}
  class TetrahedronGeometry extends Disposable {}
  class IcosahedronGeometry extends Disposable {}
  class DodecahedronGeometry extends Disposable {}

  class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scale = { setScalar() {} };
    }
  }

  return {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    MeshPhongMaterial,
    BoxGeometry,
    OctahedronGeometry,
    TetrahedronGeometry,
    IcosahedronGeometry,
    DodecahedronGeometry,
    Mesh,
  };
}

function loadScript(scriptPath, context) {
  const source = readFileSync(scriptPath, 'utf8');
  vm.runInNewContext(source, context, { filename: scriptPath });
}

function createProjectsHarness() {
  const timers = createTimerControls();
  const raf = createAnimationFrameControls();
  const document = new FakeDocument();

  const projectsContent = new FakeElement('div', document, { id: 'projects-content' });
  const wheelContainer = new FakeElement('div', document, { className: 'wheel-container' });
  const modal = new FakeElement('div', document, { id: 'projectModal' });
  const backBtn = new FakeElement('button', document, { id: 'backToProjects' });
  const nextBtn = new FakeElement('button', document, { id: 'sectionNext' });
  const prevBtn = new FakeElement('button', document, { id: 'sectionPrev' });
  const dotsContainer = new FakeElement('div', document, { id: 'sectionDots' });

  const cards = [
    new FakeElement('article', document, { className: 'project-card', dataset: { project: 'fightvision' } }),
    new FakeElement('article', document, { className: 'project-card', dataset: { project: 'website' } }),
  ];

  document.register('.wheel-container', [wheelContainer]);
  document.register('.project-card', cards);
  document.register('.bottom-nav', []);
  document.register('.mobile-menu-btn', []);
  document.register('.nav-buttons', []);
  document.register('.hello-nav-btn', []);
  document.register('.nav-btn', []);
  document.register('.nav-link', []);
  document.register('.spa-nav-btn', []);
  document.register('.nav-close-btn', []);

  const window = { document };
  const context = {
    console,
    window,
    document,
    requestAnimationFrame: raf.requestAnimationFrame,
    cancelAnimationFrame: raf.cancelAnimationFrame,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval,
    clearInterval: timers.clearInterval,
  };

  loadScript(`${REPO_ROOT}/js/spa-projects-new.js`, context);

  return {
    timers,
    raf,
    document,
    wheelContainer,
    modal,
    backBtn,
    cards,
    route: window.projectsRouteNew,
    registerIds() {
      [
        projectsContent,
        modal,
        backBtn,
        nextBtn,
        prevBtn,
        dotsContainer,
        new FakeElement('img', document, { id: 'projectHeroImage' }),
        new FakeElement('h1', document, { id: 'projectTitle' }),
        new FakeElement('div', document, { id: 'projectTechStack' }),
        new FakeElement('p', document, { id: 'projectDescription' }),
        new FakeElement('div', document, { id: 'projectLinks' }),
      ].forEach((element) => document._trackElement(element));
    },
  };
}

function createContactHarness() {
  const timers = createTimerControls();
  const raf = createAnimationFrameControls();
  const document = new FakeDocument();

  const contactContent = new FakeElement('div', document, { id: 'contact-content' });
  const buttons = [
    new FakeElement('button', document, { className: 'contact-btn', dataset: { contact: 'email' } }),
    new FakeElement('button', document, { className: 'contact-btn', dataset: { contact: 'github' } }),
  ];

  document.register('.contact-btn', buttons);
  document._trackElement(contactContent);

  const openedUrls = [];
  const window = {
    document,
    innerWidth: 1280,
    open(url, target) {
      openedUrls.push({ url, target });
    },
  };

  const context = {
    console,
    window,
    document,
    THREE: createThreeStub(),
    requestAnimationFrame: raf.requestAnimationFrame,
    cancelAnimationFrame: raf.cancelAnimationFrame,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    setInterval: timers.setInterval,
    clearInterval: timers.clearInterval,
    Math: Object.create(Math),
  };
  context.Math.random = () => 0.1;

  loadScript(`${REPO_ROOT}/js/contact.js`, context);

  return {
    timers,
    raf,
    document,
    window,
    buttons,
    contactContent,
    openedUrls,
    route: window.contactRoute,
  };
}

test('projects route cleanup removes global listeners and animation loop before re-entry', () => {
  const harness = createProjectsHarness();
  harness.registerIds();

  harness.route.init();
  harness.timers.flushNextTimeoutBatch();

  assert.equal(harness.wheelContainer.listenerCount('mousedown'), 1);
  assert.equal(harness.document.listenerCount('mousemove'), 1);
  assert.equal(harness.document.listenerCount('mouseup'), 1);
  assert.equal(harness.document.listenerCount('touchmove'), 1);
  assert.equal(harness.document.listenerCount('touchend'), 1);
  assert.equal(harness.document.listenerCount('keydown'), 1);
  assert.equal(harness.raf.pendingCount, 1);
  assert.equal(harness.cards[0].listenerCount('click'), 1);

  harness.route.cleanup();

  assert.equal(harness.wheelContainer.listenerCount('mousedown'), 0);
  assert.equal(harness.document.listenerCount('mousemove'), 0);
  assert.equal(harness.document.listenerCount('mouseup'), 0);
  assert.equal(harness.document.listenerCount('touchmove'), 0);
  assert.equal(harness.document.listenerCount('touchend'), 0);
  assert.equal(harness.document.listenerCount('keydown'), 0);
  assert.equal(harness.cards[0].listenerCount('click'), 0);
  assert.equal(harness.raf.pendingCount, 0);
  assert.equal(harness.raf.canceledCount, 1);
});

test('contact route cleanup removes button handlers, pending timers, and falling shape resources', () => {
  const harness = createContactHarness();

  harness.route.init();
  harness.timers.flushNextTimeoutBatch();
  harness.timers.flushNextTimeoutBatch();
  harness.timers.flushNextTimeoutBatch();

  assert.equal(harness.buttons[0].listenerCount('click'), 1);
  assert.equal(harness.contactContent.querySelectorAll('.falling-model').length > 0, true);
  assert.equal(harness.document.head.children.length > 0, true);
  assert.equal(harness.raf.pendingCount > 0, true);
  assert.equal(harness.timers.pendingIntervalCount, 2);

  harness.route.cleanup();

  assert.equal(harness.buttons[0].listenerCount('click'), 0);
  assert.equal(harness.contactContent.querySelectorAll('.falling-model').length, 0);
  assert.equal(harness.document.head.children.length, 0);
  assert.equal(harness.raf.pendingCount, 0);
  assert.equal(harness.timers.pendingIntervalCount, 0);
  assert.equal(harness.timers.pendingTimeoutCount, 0);
});

test('contact route cleanup cancels delayed burst timers before a late shape can spawn', () => {
  const harness = createContactHarness();

  harness.route.init();
  harness.timers.flushNextTimeoutBatch();
  harness.timers.flushNextTimeoutBatch();

  assert.equal(harness.contactContent.querySelectorAll('.falling-model').length, 1);
  assert.equal(harness.timers.pendingTimeoutCount > 0, true);

  harness.route.cleanup();

  assert.equal(harness.contactContent.querySelectorAll('.falling-model').length, 0);
  assert.equal(harness.timers.pendingTimeoutCount, 0);
});
