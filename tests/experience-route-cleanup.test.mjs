import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// resolve the repo from this file's own location — a hardcoded absolute path broke
// every test the moment the checkout moved
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');

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
}

class FakeStyle {
  setProperty(name, value) {
    this[name] = value;
  }

  removeProperty(name) {
    delete this[name];
  }
}

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.style = new FakeStyle();
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.attributes = new Map();
    this.innerHTML = '';
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
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
    this.body = new FakeElement('body');
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
    return [...(this.bySelector.get(selector) ?? [])];
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  getElementById(id) {
    return this.byId.get(id) ?? null;
  }

  register(selector, elements) {
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

  return {
    setTimeout(callback) {
      const id = nextId++;
      timeouts.set(id, callback);
      return id;
    },
    clearTimeout(id) {
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
  };
}

function loadExperienceHarness() {
  const source = readFileSync(`${REPO_ROOT}/js/experience.js`, 'utf8');
  const timers = createTimerControls();
  const document = new FakeDocument();
  const windowListeners = new Map();
  const windowObject = {
    innerHeight: 900,
    innerWidth: 1200,
    scrollY: 0,
    addEventListener(type, handler) {
      if (!windowListeners.has(type)) {
        windowListeners.set(type, new Set());
      }
      windowListeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      windowListeners.get(type)?.delete(handler);
    },
    scrollTo() {},
  };

  const cards = [new FakeElement(), new FakeElement()];
  const modal = new FakeElement('experienceModal');
  const modalContent = new FakeElement('modalContent');
  const closeBtn = new FakeElement();
  const leftSection = new FakeElement();
  const horse = new FakeElement();
  const bull = new FakeElement();
  const lion = new FakeElement();
  const educationTitle = new FakeElement();
  const experienceTitle = new FakeElement();
  const researchTitle = new FakeElement();
  const helloVisible = new FakeElement();
  const profilePhoto = new FakeElement();
  const timeline = new FakeElement();
  const experienceCards = new FakeElement();
  const researchCards = new FakeElement();
  const helloSection = new FakeElement();
  const navButton = new FakeElement();

  document.register('.card', cards);
  document.register('.close', [closeBtn]);
  document.register('.left-section', [leftSection]);
  document.register('.horse-container', [horse]);
  document.register('.bull-container-new', [bull]);
  document.register('.lion-container-new', [lion]);
  document.register('.education-title', [educationTitle]);
  document.register('.experience-title', [experienceTitle]);
  document.register('.research-title', [researchTitle]);
  document.register('.hello-visible', [helloVisible]);
  document.register('.profile-photo', [profilePhoto]);
  document.register('.timeline-container, .experience-cards, .research-cards', [timeline, experienceCards, researchCards]);
  document.register('.nav-buttons.permanent-buttons .nav-btn', [navButton]);
  document.register('.timeline-container, .cards-container, .hello-content-mobile, .profile-photo', [timeline, experienceCards, researchCards, profilePhoto]);
  document.register('.hello-section', [helloSection]);

  document.byId.set('experienceModal', modal);
  document.byId.set('modalContent', modalContent);

  const context = {
    console,
    window: windowObject,
    document,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  };

  vm.runInNewContext(source, context, { filename: `${REPO_ROOT}/js/experience.js` });

  return {
    timers,
    window: windowObject,
    windowListeners,
    document,
    cards,
    modal,
    closeBtn,
    leftSection,
    profilePhoto,
  };
}

// The card-detail modal this file used to cover was removed when experience became a
// plain scrolling page. What still matters on route exit is that the deferred layout
// pass and the registered scroll/resize handlers don't outlive the route.
test('experience cleanup cancels the deferred layout pass', () => {
  const harness = loadExperienceHarness();

  harness.window.initExperienceAnimations();
  assert.equal(harness.timers.pendingCount > 0, true);

  harness.window.cleanupExperienceAnimations();
  harness.timers.flushAll();

  assert.equal(harness.timers.pendingCount, 0);
});

test('experience cleanup unregisters tracked scroll and resize handlers', () => {
  const harness = loadExperienceHarness();

  const handler = () => {};
  harness.window.experienceScrollHandlers = [handler];
  harness.window.addEventListener('scroll', handler);
  harness.window.addEventListener('resize', handler);

  assert.equal(harness.windowListeners.get('scroll').size, 1);
  assert.equal(harness.windowListeners.get('resize').size, 1);

  harness.window.cleanupExperienceAnimations();

  assert.equal(harness.windowListeners.get('scroll').size, 0);
  assert.equal(harness.windowListeners.get('resize').size, 0);
  assert.equal(harness.window.experienceScrollHandlers.length, 0);
});

test('experience re-entry runs the layout pass again', () => {
  const harness = loadExperienceHarness();

  harness.window.initExperienceAnimations();
  harness.timers.flushAll();
  assert.equal(harness.profilePhoto.classList.contains('in-view'), true);

  harness.profilePhoto.classList.remove('in-view');
  harness.window.initExperienceAnimations();
  harness.timers.flushAll();

  assert.equal(harness.profilePhoto.classList.contains('in-view'), true);
});
