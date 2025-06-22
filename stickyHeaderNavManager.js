(function() {
  const header = document.querySelector('header');
  if (!header) return;

  const menuButton = header.querySelector('.menu-button');
  const navLinks = header.querySelectorAll('nav a[href^="#"]');

  function toggleScrolledClass() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  function toggleMenu() {
    if (!menuButton) return;
    const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isExpanded));
    header.classList.toggle('nav-open');
  }

  function closeMenu() {
    if (!menuButton) return;
    header.classList.remove('nav-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  function smoothScroll(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const targetId = link.getAttribute('href');
    if (!targetId) return;
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
    const offset = header.offsetHeight;
    const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    try {
      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus({ preventScroll: true });
    } catch (err) {
      targetEl.setAttribute('tabindex', '-1');
      targetEl.focus();
    }
    if (header.classList.contains('nav-open')) {
      closeMenu();
    }
  }

  window.addEventListener('scroll', toggleScrolledClass, { passive: true });
  toggleScrolledClass();

  if (menuButton) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', toggleMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', smoothScroll);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && header.classList.contains('nav-open')) {
      closeMenu();
    }
  });

  document.addEventListener('click', event => {
    if (header.classList.contains('nav-open') && !header.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      closeMenu();
    }
  });
})();