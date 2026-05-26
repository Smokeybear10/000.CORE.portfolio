// Typing animation — runs once on first page load, then stays typed out
(function() {
  let hasTyped = false;
  let typingRunId = 0;
  let typingTimeoutIds = [];

  function clearTypingTimeouts() {
    typingTimeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    typingTimeoutIds = [];
  }

  function scheduleTypingStep(callback, delay, runId) {
    const timeoutId = setTimeout(() => {
      typingTimeoutIds = typingTimeoutIds.filter((id) => id !== timeoutId);
      if (runId !== typingRunId) return;
      callback();
    }, delay);
    typingTimeoutIds.push(timeoutId);
  }

  function showTextImmediately() {
    const typedText1 = document.querySelector('.typed-text-1');
    const typedText2 = document.querySelector('.typed-text-2');
    const cursor1 = document.querySelector('.cursor-1');
    const cursor2 = document.querySelector('.cursor-2');
    if (!typedText1 || !typedText2) return;
    typedText1.textContent = 'THOMAS';
    typedText2.textContent = 'OU';
    if (cursor1) cursor1.style.display = 'none';
    if (cursor2) {
      cursor2.style.display = 'inline-block';
      cursor2.classList.add('blink');
    }
    const subtitles = document.querySelector('.home-subtitles');
    if (subtitles) subtitles.classList.add('visible');
  }

  function startTyping() {
    if (hasTyped) {
      showTextImmediately();
      return;
    }

    const typedText1 = document.querySelector('.typed-text-1');
    const typedText2 = document.querySelector('.typed-text-2');
    const cursor1 = document.querySelector('.cursor-1');
    const cursor2 = document.querySelector('.cursor-2');
    if (!typedText1 || !typedText2) return;

    typingRunId += 1;
    const runId = typingRunId;
    clearTypingTimeouts();

    const text1 = 'THOMAS';
    const text2 = 'OU';
    const typingDelay = 175;
    let i1 = 0;
    let i2 = 0;

    function typeLine1() {
      if (runId !== typingRunId) return;
      if (i1 < text1.length) {
        typedText1.textContent += text1.charAt(i1);
        i1++;
        scheduleTypingStep(typeLine1, typingDelay, runId);
      } else {
        if (cursor1) cursor1.style.display = 'none';
        if (cursor2) cursor2.style.display = 'inline-block';
        scheduleTypingStep(typeLine2, typingDelay, runId);
      }
    }

    function typeLine2() {
      if (runId !== typingRunId) return;
      if (i2 < text2.length) {
        typedText2.textContent += text2.charAt(i2);
        i2++;
        scheduleTypingStep(typeLine2, typingDelay, runId);
      } else {
        if (cursor2) {
          cursor2.classList.add('blink');
        }
        const subtitles = document.querySelector('.home-subtitles');
        if (subtitles) subtitles.classList.add('visible');
        hasTyped = true;
        if (typeof window.notifyHomeCubeReadyAfterTitle === 'function') {
          window.notifyHomeCubeReadyAfterTitle();
        }
      }
    }

    typedText1.textContent = '';
    typedText2.textContent = '';
    if (cursor1) cursor1.style.display = 'inline-block';
    if (cursor2) cursor2.style.display = 'none';

    scheduleTypingStep(typeLine1, 350, runId);
  }

  window.initHomeAnimations = startTyping;
  window.isHomeTypingComplete = () => hasTyped;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTyping);
  } else {
    startTyping();
  }
})();

// SPA Initialization and Route Management
document.addEventListener('DOMContentLoaded', () => {
  const router = new SPARouter();

  /** First-time title typing completion → same cube pop as return-home (cube stays hidden until this). */
  window.notifyHomeCubeReadyAfterTitle = function notifyHomeCubeReadyAfterTitle() {
    const cubeContainer = document.querySelector('#cube-container');
    if (!cubeContainer || document.body.getAttribute('data-current-route') !== 'home') return;
    scheduleHomeCubeReturnPop(cubeContainer);
  };

  /** After first visit: hide cube + nav models, then scale-pop the cube (no opacity fade). */
  function scheduleHomeCubeReturnPop(cubeContainer) {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      cubeContainer.classList.remove('home-cube-pre-pop', 'home-cube-pop-in');
      cubeContainer.style.opacity = '';
      cubeContainer.style.transform = '';
      document.body.classList.remove('home-awaiting-3d-reveal');
      return;
    }

    cubeContainer.classList.remove('home-cube-pop-in');
    cubeContainer.style.opacity = '';
    cubeContainer.style.transform = '';
    void cubeContainer.offsetWidth;

    cubeContainer.classList.add('home-cube-pre-pop');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (document.body.getAttribute('data-current-route') !== 'home') {
          cubeContainer.classList.remove('home-cube-pre-pop');
          return;
        }
        cubeContainer.classList.remove('home-cube-pre-pop');
        cubeContainer.classList.add('home-cube-pop-in');
        cubeContainer.addEventListener(
          'animationend',
          (e) => {
            if (e.target !== cubeContainer) return;
            cubeContainer.classList.remove('home-cube-pop-in');
            document.body.classList.remove('home-awaiting-3d-reveal');
          },
          { once: true }
        );
      });
    });
  }

  router.addRoute('home', {
    title: 'Thomas Ou • Portfolio',
    contentSelector: '#home-content',
    showElements: ['.name-heading', '#cube-container', '#model-container'],
    hideElements: ['.scroll-progress'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'home');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const homeNavLink = document.querySelector('.nav-link[data-spa-route="home"]');
      if (homeNavLink) homeNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'block';

      const isReturnHome =
        typeof window.isHomeTypingComplete === 'function' &&
        window.isHomeTypingComplete();

      const cubeContainer = document.querySelector('#cube-container');
      const modelContainer = document.querySelector('#model-container');

      if (modelContainer) {
        modelContainer.style.display = 'none';
        modelContainer.style.opacity = '0';
      }

      if (cubeContainer) {
        cubeContainer.style.display = 'block';
        if (isReturnHome) {
          scheduleHomeCubeReturnPop(cubeContainer);
        } else {
          cubeContainer.classList.remove('home-cube-pre-pop', 'home-cube-pop-in');
          cubeContainer.style.opacity = '';
          cubeContainer.style.transform = '';
        }
      }

      if (window.setCubeVisible) window.setCubeVisible(true);
      window.currentHoveredModel = null;

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      window.scrollTo(0, 0);

      if (window.initHomeAnimations) {
        window.initHomeAnimations();
      }

      // Give the DOM a frame to lay out containers before initializing WebGL
      requestAnimationFrame(() => {
        if (window.init3DCube) {
          window.init3DCube();
        }

        if (window.initializeNavigationModels) {
          window.initializeNavigationModels();
        }
      });
    },
    onExit: async () => {
      document.body.classList.remove('home-awaiting-3d-reveal');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';

      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) {
        cubeContainer.classList.remove('home-cube-pre-pop', 'home-cube-pop-in');
        cubeContainer.style.display = 'none';
        cubeContainer.style.opacity = '1';
        cubeContainer.style.transform = '';
      }

      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) {
        modelContainer.style.display = 'none';
        modelContainer.style.opacity = '0';
      }

      if (window.setCubeVisible) window.setCubeVisible(true);
      window.currentHoveredModel = null;

      if (window.cleanup3DCube) {
        window.cleanup3DCube();
      }

      if (window.cleanupDynamicModels) {
        window.cleanupDynamicModels();
      }

      if (window.cleanupNavigationModels) {
        window.cleanupNavigationModels();
      } else {
        window.navModelsInitialized = false;
      }
    }
  });

  router.addRoute('about', {
    title: 'Thomas Ou • About',
    contentSelector: '#about-content',
    showElements: ['.scroll-progress'],
    hideElements: ['.name-heading', '#cube-container', '#model-container'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'about');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const aboutNavLink = document.querySelector('.nav-link[data-spa-route="about"]');
      if (aboutNavLink) aboutNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'block';

      if (window.initAboutAnimations) {
        window.initAboutAnimations();
      }

      window.scrollTo(0, 0);

      if (window.updateScrollProgress) {
        window.updateScrollProgress();
      }
    },
    onExit: async () => {
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      if (window.cleanupAboutAnimations) {
        window.cleanupAboutAnimations();
      }
    }
  });

  router.addRoute('experience', {
    title: 'Thomas Ou • Experience',
    contentSelector: '#experience-content',
    showElements: ['.scroll-progress'],
    hideElements: ['.name-heading', '#cube-container', '#model-container'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'experience');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const experienceNavLink = document.querySelector('.nav-link[data-spa-route="experience"]');
      if (experienceNavLink) experienceNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'block';

      // Brighten hello sections immediately so they don't flash dimmed
      document.querySelectorAll('.hello-section').forEach(s => { s.style.opacity = '1'; });
      document.querySelectorAll('.profile-photo').forEach(p => {
        p.style.display = 'block';
        p.style.visibility = 'visible';
        p.classList.add('in-view');
      });
      document.querySelectorAll('.hello-visible').forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.classList.add('show');
      });

      setTimeout(() => {
        const leftSection = document.querySelector('.left-section');
        if (leftSection) {
          leftSection.style.display = 'block';
          leftSection.style.visibility = 'visible';
          leftSection.style.setProperty('display', 'block', 'important');
        }

        if (window.initExperienceAnimations) {
          window.initExperienceAnimations();
        } else if (window.updateScrollProgress) {
          window.updateScrollProgress();
        }
      }, 100);

      window.scrollTo(0, 0);
    },
    onExit: async () => {
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      if (window.cleanupExperienceAnimations) {
        window.cleanupExperienceAnimations();
      }
    }
  });

  router.addRoute('projects', {
    title: 'Thomas Ou • Projects',
    contentSelector: '#projects-content',
    showElements: [],
    hideElements: ['.name-heading', '#cube-container', '#model-container', '.scroll-progress'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'projects');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const projectsNavLink = document.querySelector('.nav-link[data-spa-route="projects"]');
      if (projectsNavLink) projectsNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      const projectsContent = document.getElementById('projects-content');
      if (projectsContent) {
        projectsContent.style.display = 'block';
        projectsContent.style.opacity = '1';
        projectsContent.style.visibility = 'visible';
        projectsContent.style.pointerEvents = 'auto';
        projectsContent.style.zIndex = '1000';
      }

      if (window.projectsRouteNew && window.projectsRouteNew.init) {
        window.projectsRouteNew.init();
      }

      window.scrollTo(0, 0);
    },
    onExit: async () => {
      if (window.projectsRouteNew && window.projectsRouteNew.cleanup) {
        window.projectsRouteNew.cleanup();
      }
    }
  });

  router.addRoute('contact', {
    title: 'Thomas Ou • Contact',
    contentSelector: '#contact-content',
    showElements: [],
    hideElements: ['.name-heading', '#cube-container', '#model-container', '.scroll-progress'],
    onEnter: async () => {
      document.body.setAttribute('data-current-route', 'contact');

      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const contactNavLink = document.querySelector('.nav-link[data-spa-route="contact"]');
      if (contactNavLink) contactNavLink.classList.add('active');

      const nameHeading = document.querySelector('.name-heading');
      if (nameHeading) nameHeading.style.display = 'none';
      const cubeContainer = document.querySelector('#cube-container');
      if (cubeContainer) cubeContainer.style.display = 'none';
      const modelContainer = document.querySelector('#model-container');
      if (modelContainer) modelContainer.style.display = 'none';

      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) scrollProgress.style.display = 'none';

      const contactContent = document.getElementById('contact-content');
      if (contactContent) {
        contactContent.style.display = 'block';
        contactContent.style.opacity = '1';
        contactContent.style.visibility = 'visible';
        contactContent.style.pointerEvents = 'auto';
        contactContent.style.zIndex = '1000';
      }

      if (window.contactRoute && window.contactRoute.init) {
        window.contactRoute.init();
      }

      window.scrollTo(0, 0);
    },
    onExit: async () => {
      if (window.contactRoute && window.contactRoute.cleanup) {
        window.contactRoute.cleanup();
      }
    }
  });

  window.spaRouter = router;

  window.navigateToRoute = (route) => {
    router.navigateTo(route);
  };

});

// initAboutAnimations is now defined in about.js with full GSAP re-initialization

window.updateScrollProgress = (() => {
  let activeHandler = null;
  return () => {
    const scrollProgressBar = document.querySelector('.scroll-progress-bar');
    if (activeHandler) {
      window.removeEventListener('scroll', activeHandler);
      activeHandler = null;
    }
    function updateProgress() {
      if (!scrollProgressBar) return;
      const { scrollHeight, clientHeight } = document.documentElement;
      const scrollableHeight = scrollHeight - clientHeight;
      const scrollY = window.scrollY;
      const scrollProgress = (scrollY / scrollableHeight) * 100;
      scrollProgressBar.style.transform = `translateY(-${100 - scrollProgress}%)`;
    }
    activeHandler = updateProgress;
    window.addEventListener('scroll', updateProgress);
    updateProgress();
  };
})();
