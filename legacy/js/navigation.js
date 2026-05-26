// Dynamic model loading on nav hover — HOME page only
let navigationModelInitTimeout = null;
let navigationModelCleanupFns = [];
let ensureModelVisibleTimeout = null;
let hideModelDisplayTimeout = null;

function runNavigationModelCleanup() {
  navigationModelCleanupFns.forEach((cleanupFn) => cleanupFn());
  navigationModelCleanupFns = [];
}

document.addEventListener('DOMContentLoaded', () => {
  navigationModelInitTimeout = setTimeout(() => {
    navigationModelInitTimeout = null;
    const currentRoute = document.body.getAttribute('data-current-route');
    if (currentRoute === 'home') {
      initializeNavigationModels();
    }
  }, 500);
});

function initializeNavigationModels() {
  if (window.navModelsInitialized) return;
  window.navModelsInitialized = true;
  runNavigationModelCleanup();

  const navLinks = document.querySelectorAll('.nav-link');
  const cubeContainer = document.getElementById('cube-container');
  const modelContainer = document.getElementById('model-container');

  const modelNavLinks = ['projects', 'experience', 'about', 'contact'];

  modelNavLinks.forEach(linkName => {
    const navLink = Array.from(navLinks).find(link =>
      link.textContent.toLowerCase().trim() === linkName
    );

    if (!navLink || !cubeContainer || !modelContainer) return;

    function showModel() {
      if (window.hideModelTimeout) {
        clearTimeout(window.hideModelTimeout);
        window.hideModelTimeout = null;
      }

      window.currentHoveredModel = linkName;

      if (window.loadAndShowModel) {
        window.loadAndShowModel(linkName);
      }

      cubeContainer.style.opacity = '0';
      modelContainer.style.display = 'block';
      modelContainer.style.opacity = '1';

      if (window.setCubeVisible) window.setCubeVisible(false);

      if (ensureModelVisibleTimeout) {
        clearTimeout(ensureModelVisibleTimeout);
      }
      ensureModelVisibleTimeout = setTimeout(() => {
        ensureModelVisibleTimeout = null;
        if (window.currentHoveredModel === linkName) {
          modelContainer.style.display = 'block';
          modelContainer.style.opacity = '1';
        }
      }, 200);
    }

    navLink.addEventListener('mouseenter', showModel);

    const handleTouchStart = () => {
      showModel();
    };

    const handleMouseLeave = () => {
      if (window.currentHoveredModel === linkName) {
        window.currentHoveredModel = null;
      }

      window.hideModelTimeout = setTimeout(() => {
        if (!window.currentHoveredModel) {
          cubeContainer.style.opacity = '1';
          modelContainer.style.opacity = '0';

          if (window.setCubeVisible) window.setCubeVisible(true);

          if (hideModelDisplayTimeout) {
            clearTimeout(hideModelDisplayTimeout);
          }
          hideModelDisplayTimeout = setTimeout(() => {
            hideModelDisplayTimeout = null;
            modelContainer.style.display = 'none';
          }, 300);
        }
      }, 150);
    };

    navLink.addEventListener('touchstart', handleTouchStart);
    navLink.addEventListener('mouseleave', handleMouseLeave);
    navigationModelCleanupFns.push(
      () => navLink.removeEventListener('mouseenter', showModel),
      () => navLink.removeEventListener('touchstart', handleTouchStart),
      () => navLink.removeEventListener('mouseleave', handleMouseLeave)
    );
  });
}

window.initializeNavigationModels = initializeNavigationModels;
window.cleanupNavigationModels = function() {
  if (navigationModelInitTimeout) {
    clearTimeout(navigationModelInitTimeout);
    navigationModelInitTimeout = null;
  }
  if (ensureModelVisibleTimeout) {
    clearTimeout(ensureModelVisibleTimeout);
    ensureModelVisibleTimeout = null;
  }
  if (hideModelDisplayTimeout) {
    clearTimeout(hideModelDisplayTimeout);
    hideModelDisplayTimeout = null;
  }
  if (window.hideModelTimeout) {
    clearTimeout(window.hideModelTimeout);
    window.hideModelTimeout = null;
  }

  runNavigationModelCleanup();
  window.currentHoveredModel = null;
  window.navModelsInitialized = false;
};
