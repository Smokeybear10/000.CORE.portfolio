// Scroll to top on page load
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Resume link: show notification instead of opening PDF
document.addEventListener('DOMContentLoaded', () => {
  const resumeLink = document.querySelector('.resume-link');
  const toast = document.getElementById('resume-toast');
  const toastClose = toast?.querySelector('.resume-toast-close');
  let toastTimeout = null;

  function showToast() {
    if (!toast) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
      toastTimeout = null;
    }, 6000);
  }

  function hideToast() {
    if (!toast) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.classList.remove('show');
    toastTimeout = null;
  }

  if (resumeLink) {
    resumeLink.addEventListener('click', (e) => {
      e.preventDefault();
      showToast();
    });
  }

  if (toastClose) {
    toastClose.addEventListener('click', hideToast);
  }
});

// Nudge profile photo to bright on initial paint
document.addEventListener('DOMContentLoaded', () => {
  const profilePhoto = document.querySelector('.profile-photo');
  if (profilePhoto) {
    profilePhoto.classList.add('in-view');
    // Don't set inline styles - let CSS classes handle opacity
    profilePhoto.style.visibility = 'visible';
  }
});

// Scroll progress is now managed by spa-init.js window.updateScrollProgress
// to avoid duplicate listeners accumulating on route changes.


// Left section: scrolls with page, sticks when scrolled down past threshold
document.addEventListener('DOMContentLoaded', () => {
  const leftSection = document.querySelector('.left-section');

  function updateLeftStick() {
    if (!leftSection || document.body.getAttribute('data-current-route') !== 'experience') return;
    const threshold = window.innerHeight * 0.8;
    leftSection.classList.toggle('is-stuck', window.scrollY >= threshold);
  }

  updateLeftStick();
  window.addEventListener('scroll', updateLeftStick);
  window.addEventListener('resize', updateLeftStick);
  window.updateLeftSectionPosition = updateLeftStick;
});

// Animal containers fade in/out based on section focus
document.addEventListener('DOMContentLoaded', () => {
  const horseContainer = document.querySelector('.horse-container');
  const bullContainer = document.querySelector('.bull-container-new');
  const lionContainer = document.querySelector('.lion-container-new');
  const educationTitle = document.querySelector('.education-title');
  const navButtons = document.querySelector('.nav-buttons.permanent-buttons');
  
  function updateAnimalVisibility() {
    // Check which section is in focus
    const timelineContainer = document.querySelector('.timeline-container');
    const experienceContainer = document.querySelector('.experience-cards');
    const researchContainer = document.querySelector('.research-cards');

    const isExperienceInFocus = experienceContainer && experienceContainer.classList.contains('in-view');
    const isResearchInFocus = researchContainer && researchContainer.classList.contains('in-view');
    // Education is default — show it when nothing else is in focus
    const isEducationInFocus =
      (timelineContainer && timelineContainer.classList.contains('in-view')) ||
      (!isExperienceInFocus && !isResearchInFocus);

    // Horse shows for education (fade-in timing matches timeline in experience.css)
    if (horseContainer) {
      if (isEducationInFocus) {
        horseContainer.classList.add('visible');
      } else {
        horseContainer.classList.remove('visible');
      }
    }
    
    // Bull shows for experience
    if (bullContainer) {
      if (isExperienceInFocus) {
        bullContainer.style.opacity = '1';
        bullContainer.style.visibility = 'visible';
      } else {
        bullContainer.style.opacity = '0';
        bullContainer.style.visibility = 'hidden';
      }
    }
    
    // Lion shows for research
    if (lionContainer) {
      if (isResearchInFocus) {
        lionContainer.style.opacity = '1';
        lionContainer.style.visibility = 'visible';
      } else {
        lionContainer.style.opacity = '0';
        lionContainer.style.visibility = 'hidden';
      }
    }
    
    // Research title shows when research is in focus
    const researchTitle = document.querySelector('.research-title');
    if (researchTitle) {
      if (isResearchInFocus) {
        researchTitle.style.opacity = '1';
        researchTitle.style.visibility = 'visible';
      } else {
        researchTitle.style.opacity = '0';
        researchTitle.style.visibility = 'hidden';
      }
    }
    
    // Experience title shows when experience is in focus
    const experienceTitle = document.querySelector('.experience-title');
    if (experienceTitle) {
      if (isExperienceInFocus) {
        experienceTitle.style.opacity = '1';
        experienceTitle.style.visibility = 'visible';
      } else {
        experienceTitle.style.opacity = '0';
        experienceTitle.style.visibility = 'hidden';
      }
    }
    
    // Education title shows when education is in focus (fade-in timing matches timeline in experience.css)
    if (isEducationInFocus) {
      if (educationTitle) educationTitle.classList.add('visible');
    } else {
      if (educationTitle) educationTitle.classList.remove('visible');
    }

    // Nav buttons show when education, experience, OR research is in focus (don't fade out until footer)
    if (isEducationInFocus || isExperienceInFocus || isResearchInFocus) {
      if (navButtons) navButtons.classList.add('visible');
    } else {
      if (navButtons) navButtons.classList.remove('visible');
    }
  }

  // After first entrance animation finishes, don’t replay it when .visible toggles on scroll
  if (horseContainer) {
    horseContainer.addEventListener('animationend', (e) => {
      if (e.target !== horseContainer) return;
      if (e.animationName !== 'experienceFadeInSoft') return;
      horseContainer.classList.add('horse-entrance-done');
    });
  }

  if (educationTitle) {
    educationTitle.addEventListener('animationend', (e) => {
      if (e.target !== educationTitle) return;
      if (e.animationName !== 'experienceFadeInSoft') return;
      educationTitle.classList.add('education-title-entrance-done');
    });
  }

  // Initial call and scroll listener
  updateAnimalVisibility();
  window.addEventListener('scroll', updateAnimalVisibility);
  window.addEventListener('resize', updateAnimalVisibility);
});


/**
 * Title + horse: same entrance as timeline (CSS), then brighten when timeline has .in-view.
 * Nav: stays at post-entrance dim (0.3) on About; experience-nav-bright when in Education / Exp / Research.
 */
function syncExperienceEducationDimming() {
  const route = document.body.getAttribute('data-current-route');
  const title = document.querySelector('.education-title');
  const horse = document.querySelector('.horse-container');
  const nav = document.querySelector('.nav-buttons.permanent-buttons');
  const timeline = document.querySelector('.timeline-container');

  if (route !== 'experience') {
    [title, horse, nav].forEach((el) => {
      if (!el) {
        return;
      }
      el.classList.remove(
        'education-timeline-focused',
        'experience-nav-bright',
        'experience-education-dimmed'
      );
    });
    return;
  }

  const timelineFocused = Boolean(timeline && timeline.classList.contains('in-view'));
  const section = window.currentSection || 'about';

  [title, horse].forEach((el) => {
    if (!el) return;
    el.classList.toggle('education-timeline-focused', timelineFocused);
    el.classList.remove('experience-education-dimmed');
  });

  if (nav) {
    nav.classList.remove('experience-education-dimmed');
    nav.classList.toggle('experience-nav-bright', section !== 'about');
  }
}

// Shared section visibility function - used by both normal page load and SPA mode
function createSectionVisibilityHandler() {
  const timelineContainer = document.querySelector('.timeline-container');
  const experienceContainer = document.querySelector('.experience-cards');
  const researchContainer = document.querySelector('.research-cards');
  const helloContentMobile = document.querySelector('.hello-content-mobile');
  const helloSection = document.querySelector('.top-container .hello-section'); // Hello I am Thomas section

  const sections = [
    { element: timelineContainer, name: 'education' },
    { element: experienceContainer, name: 'experience' },
    { element: researchContainer, name: 'research' },
    { element: helloContentMobile, name: 'hello-mobile' }
  ].filter(section => section.element);

  return function updateSectionVisibility() {
    // Skip all dimming while modal is open
    if (document.body.classList.contains('modal-open')) return;

    if (document.body.getAttribute('data-current-route') !== 'experience') {
      syncExperienceEducationDimming();
    }

    const windowHeight = window.innerHeight;
    let activeSection = null;
    let maxVisibility = 0;
    
    const helloSections = document.querySelectorAll('.hello-section');
    const helloVisibleElements = document.querySelectorAll('.hello-visible');

    if (helloSection) {
      const helloRect = helloSection.getBoundingClientRect();
      const helloVisibleTop = Math.max(0, helloRect.top);
      const helloVisibleBottom = Math.min(windowHeight, helloRect.bottom);
      const helloVisibleHeight = Math.max(0, helloVisibleBottom - helloVisibleTop);
      const helloVisibilityRatio = helloRect.height > 0 ? helloVisibleHeight / helloRect.height : 0;
      const helloScrollGate = window.scrollY < 200;

      if (helloVisibilityRatio > 0.3 && helloScrollGate) {
        helloSections.forEach(section => {
          section.style.opacity = '1';
        });
        // Show photo and buttons
        helloVisibleElements.forEach(element => {
          element.classList.add('show');
        });
        // Dim all other sections including left-section (Education/3D/buttons)
        sections.forEach(section => {
          section.element.classList.remove('in-view');
        });
        const leftSection = document.querySelector('.left-section');
        if (leftSection) leftSection.classList.remove('in-view');

        // Brighten profile photo when at top
        const profilePhoto = document.querySelector('.profile-photo');
        if (profilePhoto) {
          profilePhoto.style.opacity = '';
          profilePhoto.classList.add('in-view');
        }

        // Update hello button styling when hello section is in view
        if (window.updateHelloButtonStyling) {
          window.updateHelloButtonStyling('about', true);
        }
        window.currentSection = 'about';
        syncExperienceEducationDimming();
        return;
      } else {
        // Dim hello sections
        helloSections.forEach(section => {
          section.style.opacity = '0.3';
        });
        // Hide photo and buttons
        helloVisibleElements.forEach(element => {
          element.classList.remove('show');
        });
      }
    }
    
    // Find which section is most visible
    sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(windowHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const totalHeight = rect.height;
      const visibilityRatio = totalHeight > 0 ? visibleHeight / totalHeight : 0;
      
      // Different thresholds for different sections
      let threshold = 0.3; // Default for education and experience
      if (section.name === 'research') {
        threshold = 0.5; // Higher threshold for research - needs more visibility to stay in focus
      }
      
      // Check if we're close to footer for research section
      let finalVisibilityRatio = visibilityRatio;
      if (section.name === 'research') {
        const footer = document.querySelector('footer');
        if (footer) {
          const footerRect = footer.getBoundingClientRect();
          const distanceToFooter = footerRect.top - windowHeight;
          
          // If footer is within 200px of viewport, reduce research visibility
          if (distanceToFooter < 50) {
            const footerProximity = Math.max(0, (50 - distanceToFooter) / 50);
            finalVisibilityRatio = visibilityRatio * (1 - footerProximity * 0.8);
          }
        }
      }
      
      if (finalVisibilityRatio > maxVisibility && finalVisibilityRatio > threshold) {
        maxVisibility = finalVisibilityRatio;
        activeSection = section;
      }
    });
    
    // Apply focus to most visible section, dim others
    sections.forEach(section => {
      if (section === activeSection) {
        section.element.classList.add('in-view');
              } else {
        section.element.classList.remove('in-view');
      }
    });

    // Left-section bright only when education/experience/research in focus
    const leftSection = document.querySelector('.left-section');
    if (leftSection) {
      if (activeSection && ['education', 'experience', 'research'].includes(activeSection.name)) {
        leftSection.classList.add('in-view');
      } else {
        leftSection.classList.remove('in-view');
      }
    }

    // Update navigation button highlighting
    const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
    if (navButtons.length >= 4) {
      // Remove active class from all buttons
      navButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class based on current section
      let currentSectionName = 'about'; // default (top section is About)
      if (activeSection) {
        if (activeSection.name === 'education') {
          navButtons[1]?.classList.add('active'); // Education button
          currentSectionName = 'education';
        } else if (activeSection.name === 'experience') {
          navButtons[2]?.classList.add('active'); // Experience button
          currentSectionName = 'experience';
        } else if (activeSection.name === 'research') {
          navButtons[3]?.classList.add('active'); // Research button
          currentSectionName = 'research';
        }
      } else {
        // When no section is active, we're in the About section (top)
        navButtons[0]?.classList.add('active'); // About button
      }
      
      // Store current section globally
      window.currentSection = currentSectionName;

      // Handle hello-content-mobile in vertical mode
      const isVerticalMode = window.innerHeight > window.innerWidth || window.innerWidth <= 768;
      const helloContentMobile = document.querySelector('.hello-content-mobile');
      
      if (isVerticalMode && helloContentMobile) {
        if (currentSectionName === 'about') {
          // In about section - make hello-content-mobile bright
          helloContentMobile.classList.add('in-view');
        } else {
          // In other sections - dim hello-content-mobile
          helloContentMobile.classList.remove('in-view');
        }
      }
      
      // Update button styling based on new active states
      
      // Update hello button styling based on current section and hello visibility
      if (window.updateHelloButtonStyling) {
        window.updateHelloButtonStyling(currentSectionName, false); // Not in hello section when other sections are active
      }
    }

    // Handle profile photo dimming based on current section
    const profilePhoto = document.querySelector('.profile-photo');
    if (profilePhoto) {
      // Clear any inline opacity overrides
      profilePhoto.style.opacity = '';

      // Profile photo should be bright only when About section is active (no activeSection)
      if (activeSection === null) {
        profilePhoto.classList.add('in-view');
      } else {
        // Dim profile photo when in education, experience, or research sections
        profilePhoto.classList.remove('in-view');
      }
    }

    syncExperienceEducationDimming();
  };
}

// Single section focus - only one section can be in focus at a time
document.addEventListener('DOMContentLoaded', () => {
  const updateSectionVisibility = createSectionVisibilityHandler();

  // Initial call and scroll listener
  updateSectionVisibility();
  window.addEventListener('scroll', updateSectionVisibility);
  window.addEventListener('resize', updateSectionVisibility);
});

// Shared scroll-to-section logic
function scrollToSection(sectionName) {
  const sectionMap = {
    'about': null,
    'education': '.timeline-container',
    'experience': '.experience-cards',
    'research': '.research-cards'
  };

  if (sectionName === 'about') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const selector = sectionMap[sectionName];
  if (selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Navigation button click handlers
document.addEventListener('DOMContentLoaded', () => {
  const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
  const sectionNames = ['about', 'education', 'experience', 'research'];

  navButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      scrollToSection(sectionNames[index]);
    });
  });

  // Hello navigation button click handlers
  const helloNavButtons = document.querySelectorAll('.hello-nav-btn');

  window.updateHelloButtonStyling = function() {};

  helloNavButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToSection(button.getAttribute('data-section'));
    });
  });
});



// Mobile/small-screen nav — tap trigger dot to toggle, no auto-show on proximity
document.addEventListener('DOMContentLoaded', () => {
  const bottomNav = document.querySelector('.bottom-nav');
  const triggerDot = document.querySelector('.nav-trigger-dot');
  if (!bottomNav || !triggerDot) return;

  const isSmallScreen = () => window.matchMedia('(orientation: portrait), (max-width: 1100px)').matches;

  function showNav() {
    if (!isSmallScreen()) return;
    if (window.spaRouter && window.spaRouter.isTransitioning) return;
    bottomNav.classList.add('show');
    triggerDot.classList.add('hidden');
  }

  function hideNav() {
    bottomNav.classList.remove('show');
    triggerDot.classList.remove('hidden');
  }

  // Tap trigger dot to toggle nav
  triggerDot.addEventListener('click', (e) => {
    e.stopPropagation();
    if (bottomNav.classList.contains('show')) {
      hideNav();
    } else {
      showNav();
    }
  });

  // Close nav when tapping elsewhere
  document.addEventListener('touchstart', (e) => {
    if (!isSmallScreen()) return;
    if (!bottomNav.contains(e.target) && !triggerDot.contains(e.target)) {
      hideNav();
    }
  });

  // Close nav after clicking a nav link
  bottomNav.addEventListener('click', (e) => {
    if (e.target.closest('.nav-link')) {
      hideNav();
    }
  });
});

let experienceInitTimeout = null;

// SPA-specific initialization functions
window.initExperienceAnimations = function() {
  window.cleanupExperienceAnimations();

  if (window.experienceScrollHandlers) {
    window.experienceScrollHandlers.forEach(handler => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    });
    window.experienceScrollHandlers = [];
  }
  
  const isVerticalMode = window.innerHeight > window.innerWidth || window.innerWidth <= 768;

  experienceInitTimeout = setTimeout(() => {
    experienceInitTimeout = null;
    if (isVerticalMode) {
      
      const leftSection = document.querySelector('.left-section');
      const horseContainer = document.querySelector('.horse-container');
      const bullContainer = document.querySelector('.bull-container-new');
      const lionContainer = document.querySelector('.lion-container-new');
      const educationTitle = document.querySelector('.education-title');
      const experienceTitle = document.querySelector('.experience-title');
      const researchTitle = document.querySelector('.research-title');
      
      if (leftSection) leftSection.style.display = 'none';
      if (horseContainer) horseContainer.style.display = 'none';
      if (bullContainer) bullContainer.style.display = 'none';
      if (lionContainer) lionContainer.style.display = 'none';
      if (educationTitle) educationTitle.style.display = 'none';
      if (experienceTitle) experienceTitle.style.display = 'none';
      if (researchTitle) researchTitle.style.display = 'none';
      
      const helloSections = document.querySelectorAll('.hello-section');
      const helloVisibleElements = document.querySelectorAll('.hello-visible');
      const profilePhotos = document.querySelectorAll('.profile-photo');
      
      helloSections.forEach(section => {
        section.style.opacity = '1';
      });
      helloVisibleElements.forEach(element => {
        element.classList.add('show');
      });
      profilePhotos.forEach(photo => {
        photo.style.display = 'block';
        photo.style.visibility = 'visible';
        photo.classList.add('in-view');
      });
      
      const sections = document.querySelectorAll('.timeline-container, .experience-cards, .research-cards');
      sections.forEach(section => {
        section.classList.remove('in-view');
      });
      
      const navButtons = document.querySelectorAll('.nav-buttons.permanent-buttons .nav-btn');
      navButtons.forEach(btn => btn.classList.remove('active'));
      if (navButtons[0]) navButtons[0].classList.add('active');
      
    } else {
      const leftSection = document.querySelector('.left-section');
      if (leftSection) leftSection.style.display = 'block';
      
      const profilePhotos = document.querySelectorAll('.profile-photo');
      profilePhotos.forEach(photo => {
        photo.style.display = 'block';
        photo.style.visibility = 'visible';
        photo.classList.add('in-view');
      });

      const helloSections = document.querySelectorAll('.hello-section');
      helloSections.forEach(section => {
        section.style.opacity = '1';
      });
      const helloVisibleElements = document.querySelectorAll('.hello-visible');
      helloVisibleElements.forEach(element => {
        element.classList.add('show');
      });
    }
    
    if (window.updateButtonStyling) {
      window.updateButtonStyling();
    }
  }, 150);
};

window.cleanupExperienceAnimations = function() {
  document.querySelector('.horse-container')?.classList.remove('horse-entrance-done');
  document.querySelector('.education-title')?.classList.remove('education-title-entrance-done');

  syncExperienceEducationDimming();
  if (experienceInitTimeout) {
    clearTimeout(experienceInitTimeout);
    experienceInitTimeout = null;
  }

  // Remove other scroll handlers
  if (window.experienceScrollHandlers) {
    window.experienceScrollHandlers.forEach(handler => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    });
    window.experienceScrollHandlers = [];
  }
  
};

// Store scroll handlers for cleanup
window.experienceScrollHandlers = [];


