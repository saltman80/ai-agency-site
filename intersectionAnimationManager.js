class IntersectionAnimationManager {
  constructor(selector = 'section, .service-card, .project-card', options = {}) {
    this.selector = selector;
    this.options = options;
    this.observer = null;
    this.remaining = 0;
  }

  init() {
    const elements = document.querySelectorAll(this.selector);
    this.remaining = elements.length;
    if (this.remaining === 0) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('in-view'));
      return;
    }

    this.observer = new IntersectionObserver(
      this.handleIntersect.bind(this),
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );
    elements.forEach(el => this.observer.observe(el));
  }

  handleIntersect(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');

        // Animate skill bars when About section comes into view:
        entry.target.querySelectorAll('.skill-progress').forEach(bar => {
          bar.style.width = bar.getAttribute('data-progress');
        });

        observer.unobserve(entry.target);
        this.remaining--;
      }
    });

    if (this.remaining <= 0) {
      observer.disconnect();
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.remaining = 0;
    }
  }
}

function initIntersectionAnimationManager() {
  const manager = new IntersectionAnimationManager();
  manager.init();
  document.getElementById('home').classList.add('in-view');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntersectionAnimationManager);
} else {
  initIntersectionAnimationManager();
}
