import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const REPO_ROOT = '/Users/thomasou/Github/THOMAS';

class FakeElement {
  constructor() {
    this.textContent = '';
    this.style = {};
    this.classList = { add() {}, remove() {}, contains() { return false; } };
  }
}

class FakeDocument {
  constructor() {
    this.readyState = 'complete';
    this.listeners = new Map();
    this.elements = {
      '.typed-text-1': new FakeElement(),
      '.typed-text-2': new FakeElement(),
      '.cursor-1': new FakeElement(),
      '.cursor-2': new FakeElement(),
      '.home-subtitles': new FakeElement(),
    };
  }

  addEventListener(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(handler);
  }

  querySelector(selector) {
    return this.elements[selector] ?? null;
  }

  querySelectorAll() {
    return [];
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
  };
}

test('home typing animation resets instead of duplicating when re-started mid-flight', () => {
  const source = readFileSync(`${REPO_ROOT}/js/spa-init.js`, 'utf8');
  const document = new FakeDocument();
  const timers = createTimerControls();

  const context = {
    console,
    document,
    window: {},
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    SPARouter: function SPARouter() {},
  };

  vm.runInNewContext(source, context, { filename: `${REPO_ROOT}/js/spa-init.js` });

  context.window.initHomeAnimations();
  timers.flushAll();

  assert.equal(document.querySelector('.typed-text-1').textContent, 'THOMAS');
  assert.equal(document.querySelector('.typed-text-2').textContent, 'OU');
});
