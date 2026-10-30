(() => {
  const projectToken = 'phc_szHkLHBhNCGCsBPSzPXw6wGKAhBd5hHBzh6NQs8B4eik';
  const apiHost = 'https://us.i.posthog.com';
  const allowedHosts = ['thomasou.com', 'www.thomasou.com', 'portfolio-smokeybear10s-projects.vercel.app'];
  if (!projectToken || !allowedHosts.includes(location.hostname)) return;

  const panel = document.getElementById('analytics-preferences');
  const form = document.getElementById('analytics-consent');
  const replay = document.getElementById('analytics-replay');
  const status = document.getElementById('analytics-status');
  const settings = document.querySelectorAll('.analytics-settings');
  const storageKey = 'thomasou-analytics-consent-v1';
  const sections = ['about', 'research', 'notes', 'cv', 'blog', 'math'];
  const hasSections = Boolean(document.querySelector('.page-section'));
  const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  let consent = readConsent();
  let client;
  let loading = false;
  let scheduled = false;
  let timer = 0;
  let lastPage = '';
  let lastSection = '';
  let wasVisible = !document.hidden;
  let lastActivity = performance.now();
  let lastTick = lastActivity;
  let activeSeconds = 0;
  let scrollQueued = false;
  let opener;
  const milestones = new Set();

  function validConsent(value) {
    return ['analytics', 'replay', 'declined'].includes(value) ? value : null;
  }

  function readConsent() {
    try {
      return validConsent(localStorage.getItem(storageKey));
    } catch {
      return null;
    }
  }

  function permitted() {
    return !privacySignal && (consent === 'analytics' || consent === 'replay');
  }

  function page() {
    if (hasSections) {
      const section = sections.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'about';
      return { section, path: `/#${section}` };
    }
    return { section: 'blog', path: location.pathname };
  }

  function cleanUrl(value) {
    try {
      const url = new URL(value);
      const hash = sections.includes(url.hash.slice(1)) ? url.hash : '';
      return `${url.origin}${url.pathname}${hash}`;
    } catch {
      return '';
    }
  }

  function sanitize(event) {
    if (!permitted()) return null;
    for (const properties of [event.properties, event.properties.$set, event.properties.$set_once]) {
      if (!properties) continue;
      for (const key of ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer']) {
        if (properties[key]) properties[key] = cleanUrl(properties[key]);
      }
      delete properties.$search_keyword;
      delete properties.$initial_search_keyword;
    }
    return event;
  }

  function capture(name, properties = {}) {
    if (!client || !permitted()) return;
    client.capture(name, { ...page(), ...properties });
  }

  function updateActiveTime() {
    const now = performance.now();
    if (wasVisible && permitted()) {
      activeSeconds += Math.max(0, Math.min(now, lastActivity + 30000) - lastTick) / 1000;
    }
    lastTick = now;
  }

  function flushEngagement() {
    updateActiveTime();
    const seconds = Math.round(activeSeconds);
    if (seconds && lastPage) capture('page_engagement', { section: lastSection, path: lastPage, active_seconds: seconds, $current_url: `https://thomasou.com${lastPage}` });
    activeSeconds = 0;
  }

  function pageview() {
    if (!client || !permitted()) return;
    const current = page();
    if (current.path === lastPage) return;
    flushEngagement();
    lastPage = current.path;
    lastSection = current.section;
    milestones.clear();
    lastActivity = lastTick = performance.now();
    capture('$pageview', { $current_url: `https://thomasou.com${current.path}`, $pathname: hasSections ? (current.section === 'about' ? '/' : `/${current.section}`) : current.path });
    checkScroll();
  }

  function checkScroll() {
    if (!client || !permitted()) return;
    const article = document.querySelector('.post-prose');
    if (!article || !article.getClientRects().length) return;
    const bounds = article.getBoundingClientRect();
    const percentage = Math.min(100, Math.max(0, (innerHeight - bounds.top) / bounds.height * 100));
    for (const milestone of [25, 50, 75, 100]) {
      if (percentage < milestone || milestones.has(milestone)) continue;
      milestones.add(milestone);
      capture('article_scroll', { percent: milestone });
    }
  }

  function configureReplay() {
    const enabled = consent === 'replay';
    client.set_config({
      autocapture: enabled ? { dom_event_allowlist: ['click'], element_allowlist: ['a', 'button'], capture_copied_text: false, capture_value_css_selector_allowlist: [] } : false,
      capture_heatmaps: enabled,
      disable_session_recording: !enabled
    });
    if (enabled) client.startSessionRecording();
    else client.stopSessionRecording();
  }

  function startTracking() {
    if (!permitted()) return;
    client.opt_in_capturing({ captureEventName: false });
    configureReplay();
    status.hidden = true;
    lastActivity = lastTick = performance.now();
    if (!timer) timer = window.setInterval(updateActiveTime, 15000);
    pageview();
  }

  function stopTracking() {
    clearInterval(timer);
    timer = 0;
    activeSeconds = 0;
    lastPage = '';
    milestones.clear();
    if (!client) return;
    client.stopSessionRecording();
    client.reset(true);
    client.opt_out_capturing();
  }

  function loadSdk() {
    scheduled = false;
    if (!permitted() || client || loading) return;
    loading = true;
    const script = document.createElement('script');
    script.src = 'https://us-assets.i.posthog.com/static/array.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      loading = false;
      script.remove();
      status.textContent = 'Analytics could not load. The rest of the site still works normally.';
      status.hidden = false;
    };
    script.onload = () => {
      loading = false;
      if (!permitted()) return;
      window.posthog.init(projectToken, {
        api_host: apiHost,
        ui_host: 'https://us.posthog.com',
        autocapture: false,
        mask_all_text: true,
        mask_all_element_attributes: true,
        capture_pageview: false,
        capture_pageleave: false,
        capture_heatmaps: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_feature_flags: true,
        enable_recording_console_log: false,
        person_profiles: 'never',
        respect_dnt: true,
        opt_out_capturing_by_default: true,
        opt_out_persistence_by_default: true,
        before_send: sanitize,
        session_recording: {
          maskAllInputs: true,
          blockSelector: 'canvas, .ambient-background, #analytics-preferences',
          attributeFilter: ['class', 'hidden', 'open', 'src', 'href', 'aria-expanded', 'aria-hidden', 'disabled', 'checked', 'selected'],
          recordHeaders: false,
          recordBody: false,
          captureCanvas: { recordCanvas: false },
          maskCapturedNetworkRequestFn: request => {
            if (Object.keys(request).length !== 1 || typeof request.name !== 'string') return null;
            return { name: cleanUrl(request.name) };
          }
        },
        loaded: instance => {
          client = instance;
          if (permitted()) startTracking();
          else stopTracking();
        }
      });
    };
    document.head.append(script);
  }

  function scheduleSdk() {
    if (!permitted() || scheduled || loading || client) return;
    scheduled = true;
    const idle = () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(loadSdk, { timeout: 2000 });
      else window.setTimeout(loadSdk, 500);
    };
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  }

  function setPanel(open) {
    panel.hidden = !open;
    settings.forEach(button => button.setAttribute('aria-expanded', String(open)));
  }

  function closePreferences() {
    setPanel(false);
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  function applyConsent(value) {
    consent = value;
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      status.textContent = 'Your choice will apply until you close this page.';
      status.hidden = false;
    }
    if (!permitted()) stopTracking();
    else if (client) startTracking();
    else scheduleSdk();
    closePreferences();
  }

  settings.forEach(button => {
    button.hidden = false;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      opener = button;
      replay.checked = consent === 'replay';
      setPanel(true);
      panel.focus({ preventScroll: true });
    });
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!privacySignal) applyConsent(replay.checked ? 'replay' : 'analytics');
  });
  document.getElementById('analytics-close').addEventListener('click', closePreferences);
  document.getElementById('analytics-decline').addEventListener('click', () => applyConsent('declined'));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePreferences();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    consent = validConsent(event.newValue);
    if (!permitted()) stopTracking();
    else if (client) startTracking();
    else scheduleSdk();
    replay.checked = consent === 'replay';
    setPanel(consent === null && !privacySignal);
  });
  window.addEventListener('hashchange', pageview);
  window.addEventListener('pagehide', flushEngagement);
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    consent = readConsent();
    replay.checked = consent === 'replay';
    setPanel(consent === null && !privacySignal);
    lastPage = '';
    activeSeconds = 0;
    wasVisible = !document.hidden;
    if (!permitted()) stopTracking();
    else if (client) startTracking();
    else scheduleSdk();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushEngagement();
    wasVisible = !document.hidden;
    lastActivity = lastTick = performance.now();
  });
  function markActivity() {
    if (!client || !permitted()) return;
    updateActiveTime();
    lastActivity = lastTick;
  }
  for (const event of ['pointerdown', 'keydown', 'pointermove']) {
    window.addEventListener(event, markActivity, { passive: true });
  }
  window.addEventListener('scroll', () => {
    markActivity();
    if (!permitted() || scrollQueued) return;
    scrollQueued = true;
    window.setTimeout(() => {
      scrollQueued = false;
      checkScroll();
    }, 250);
  }, { passive: true });
  document.addEventListener('click', event => {
    if (!client || !permitted() || event.button !== 0) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.closest('#analytics-preferences')) return;
    const url = new URL(link.href);
    if (url.protocol === 'mailto:') {
      capture('contact_click', { channel: 'email', context: link.closest('.resume-request') ? 'resume_request' : 'social' });
      return;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return;
    const properties = { destination_host: url.hostname, destination_path: url.pathname };
    if (link.hasAttribute('download')) capture('file_download_click', properties);
    else if (link.matches('.note-title, .note-pdf') && event.defaultPrevented && document.getElementById('pdf-preview')?.open) capture('pdf_preview', properties);
    else if (/\.pdf$/i.test(url.pathname)) capture('pdf_open', properties);
    else if (url.origin !== location.origin) capture('outbound_link_click', properties);
  });

  if (privacySignal) {
    status.textContent = 'Your browser asks not to be tracked. Analytics and session replay are off.';
    status.hidden = false;
    replay.disabled = true;
    form.querySelector('[type="submit"]').disabled = true;
    stopTracking();
  } else if (consent === null) {
    setPanel(true);
  } else if (permitted()) {
    scheduleSdk();
  }
})();
