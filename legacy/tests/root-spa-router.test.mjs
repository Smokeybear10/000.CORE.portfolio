import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.title = '';
    this.body = {
      style: {},
      classList: {
        add() {},
        remove() {},
      },
    };
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(handler);
  }

  querySelectorAll() {
    return [];
  }

  querySelector() {
    return null;
  }
}

class FakeWindow {
  constructor({ pathname = '/index.html', hash = '' } = {}) {
    this.listeners = new Map();
    this.location = { pathname, hash };
    this.historyCalls = [];
    this.history = {
      pushState: (state, title, url) => {
        this.historyCalls.push({ method: 'pushState', state, title, url });
        this.#applyUrl(url);
      },
      replaceState: (state, title, url) => {
        this.historyCalls.push({ method: 'replaceState', state, title, url });
        this.#applyUrl(url);
      },
    };
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(handler);
  }

  dispatchEvent(event) {
    this.listeners.get(event.type)?.forEach((handler) => handler(event));
  }

  #applyUrl(url) {
    if (!url) {
      return;
    }

    const [pathname, hash] = url.split('#');
    this.location.pathname = pathname || this.location.pathname;
    this.location.hash = hash ? `#${hash}` : '';
  }
}

class FakeCustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
}

function loadRouterHarness(options) {
  const source = readFileSync('/Users/thomasou/Github/THOMAS/js/spa-router.js', 'utf8');
  const document = new FakeDocument();
  const window = new FakeWindow(options);
  const context = {
    console,
    document,
    window,
    CustomEvent: FakeCustomEvent,
    setTimeout,
  };

  vm.runInNewContext(source, context, { filename: 'js/spa-router.js' });

  const Router = window.SPARouter;
  Router.prototype.fadeOut = async function fadeOut() {};
  Router.prototype.fadeIn = async function fadeIn() {};
  Router.prototype.closeMobileNav = function closeMobileNav() {};
  Router.prototype.updateElementVisibility = function updateElementVisibility() {};
  Router.prototype.showContent = function showContent() {};
  Router.prototype.updateNavigation = function updateNavigation() {};

  return { Router, window, document };
}

async function flushAsyncWork() {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
  }
}

test('router activates the initial hash route after routes are registered', async () => {
  const { Router, document } = loadRouterHarness({ hash: '#projects' });
  const router = new Router();

  router.addRoute('home', { title: 'Home', contentSelector: '#home' });
  router.addRoute('projects', { title: 'Projects', contentSelector: '#projects' });

  await flushAsyncWork();

  assert.equal(router.getCurrentRoute(), 'projects');
  assert.equal(document.title, 'Projects');
});

test('router pushes route-specific history entries instead of replacing everything with index', async () => {
  const { Router, window } = loadRouterHarness();
  const router = new Router();

  router.addRoute('home', { title: 'Home', contentSelector: '#home' });
  router.addRoute('contact', { title: 'Contact', contentSelector: '#contact' });

  await flushAsyncWork();
  router.navigateTo('contact');
  await flushAsyncWork();

  assert.equal(router.getCurrentRoute(), 'contact');
  assert.equal(window.historyCalls.at(-1).method, 'pushState');
  assert.equal(window.historyCalls.at(-1).state.route, 'contact');
  assert.equal(window.historyCalls.at(-1).title, 'Contact');
  assert.equal(window.historyCalls.at(-1).url, '/index.html#contact');
  assert.equal(window.location.hash, '#contact');
});

test('router uses browser location on popstate instead of forcing home', async () => {
  const { Router, window } = loadRouterHarness();
  const router = new Router();

  router.addRoute('home', { title: 'Home', contentSelector: '#home' });
  router.addRoute('about', { title: 'About', contentSelector: '#about' });

  await flushAsyncWork();
  window.location.hash = '#about';
  window.dispatchEvent({ type: 'popstate' });
  await flushAsyncWork();

  assert.equal(router.getCurrentRoute(), 'about');
});
