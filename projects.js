(() => {
  const filters = document.querySelector('.project-filters');
  const buttons = Array.from(filters.querySelectorAll('button'));
  const groups = Array.from(document.querySelectorAll('[data-project-category]'));
  const count = document.querySelector('.project-count');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.projectFilter;
      let total = 0;

      groups.forEach(group => {
        group.hidden = category !== 'all' && group.dataset.projectCategory !== category;
        if (!group.hidden) total += group.querySelectorAll('.project-entry').length;
      });

      buttons.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      count.textContent = `${total} ${total === 1 ? 'project' : 'projects'}`;
    });
  });

  filters.hidden = false;
})();
