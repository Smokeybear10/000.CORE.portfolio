// About page functionality (no scroll-triggered entrance animations)

// Tools dropdown - click header to expand/collapse
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.tools-dropdown-header');
  const dropdown = document.querySelector('.tools-dropdown');
  if (header && dropdown) {
    header.addEventListener('click', () => dropdown.classList.toggle('active'));
  }
});

window.initAboutAnimations = function () {};
window.cleanupAboutAnimations = function () {};
