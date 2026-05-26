// Contact page (2D) — button handlers only
let contactInitTimeout = null;
let contactButtonCleanupFns = [];
let contactButtonRevealTimeouts = [];

function clearContactButtonHandlers() {
  contactButtonCleanupFns.forEach((cleanupFn) => cleanupFn());
  contactButtonCleanupFns = [];
}

function clearContactButtonRevealTimeouts() {
  contactButtonRevealTimeouts.forEach((id) => clearTimeout(id));
  contactButtonRevealTimeouts = [];
}

function initContact() {
  cleanupContact();

  const contactContent = document.getElementById('contact-content');
  if (contactContent) {
    contactContent.style.display = 'block';
    contactContent.style.opacity = '1';
    contactContent.style.visibility = 'visible';
    contactContent.style.pointerEvents = 'auto';
    contactContent.style.zIndex = '1000';
  }

  contactInitTimeout = setTimeout(() => {
    contactInitTimeout = null;
    setupContactButtons();
  }, 100);
}

function setupContactButtons() {
  const contactButtons = document.querySelectorAll('.contact-btn');
  if (!contactButtons.length) return;

  clearContactButtonHandlers();
  clearContactButtonRevealTimeouts();

  contactButtons.forEach((button) => {
    button.classList.remove('contact-btn-revealed');
  });

  const staggerDelayMs = 115;
  contactButtons.forEach((button, index) => {
    const timeoutId = setTimeout(() => {
      button.classList.add('contact-btn-revealed');
    }, index * staggerDelayMs);
    contactButtonRevealTimeouts.push(timeoutId);
  });

  contactButtons.forEach((button) => {
    const contactType = button.dataset.contact;

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      switch (contactType) {
        case 'email':
          window.open('mailto:thomasou@sas.upenn.edu', '_blank');
          break;
        case 'linkedin':
          window.open('https://www.linkedin.com/in/thomasou2006', '_blank');
          break;
        case 'github':
          window.open('https://github.com/Smokeybear10', '_blank');
          break;
      }
    };

    button.addEventListener('click', handleClick);
    contactButtonCleanupFns.push(() => button.removeEventListener('click', handleClick));
    button.style.pointerEvents = 'auto';
    button.style.cursor = 'pointer';
  });
}

function cleanupContact() {
  if (contactInitTimeout) {
    clearTimeout(contactInitTimeout);
    contactInitTimeout = null;
  }
  clearContactButtonHandlers();
  clearContactButtonRevealTimeouts();
}

window.contactRoute = {
  init: initContact,
  cleanup: cleanupContact
};
