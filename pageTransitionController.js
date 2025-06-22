(function() {
  class PageTransitionController {
    constructor() {
      this.overlayClass = 'page-transition-overlay';
      this.enteringClass = 'page-transition-enter';
      this.exitingClass = 'page-transition-exit';
      this.activeClass = 'active';
      this.isAnimating = false;
      this.overlay = null;
    }

    init() {
      this.createOverlay();
      const initialHash = window.location.hash || '#home';
      this.navigate(initialHash, /*isPop=*/true);
    }

    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.classList.add(this.overlayClass);
      this.overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.overlay);
    }

    onLinkClick(event) {
      if (this.isAnimating) return;
      const link = event.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      if (href === window.location.hash) return;
      this.navigate(href);
    }

    onPopState() {
      const hash = window.location.hash;
      if (this.isAnimating || !hash) return;
      const id = hash.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      this.navigate(hash, true);
    }

    async navigate(targetHash, isPop = false) {
      this.isAnimating = true;
      try {
        await this.transitionOut();
        if (!isPop) history.pushState(null, '', targetHash);

        const id = targetHash.slice(1);
        if (id === 'home') {
          window.scrollTo({ top: 0, behavior: 'auto' });
        } else {
          document.getElementById(id).scrollIntoView({ behavior: 'auto', block: 'start' });
        }

        document.querySelectorAll('.navbar nav a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.navbar nav a[href="${targetHash}"]`)?.classList.add('active');

        await this.transitionIn();
      } finally {
        this.isAnimating = false;
      }
    }

    updateActiveLink(hash) {
      const links = document.querySelectorAll('.navbar nav li a');
      links.forEach(a => a.classList.remove('active'));
      const target = Array.from(links).find(a => a.getAttribute('href') === hash);
      if (target) target.classList.add('active');
    }

    scrollToSection(hash) {
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }

    transitionOut() {
      return this._transition(this.enteringClass, this.exitingClass);
    }

    transitionIn() {
      return this._transition(this.exitingClass, this.enteringClass, true);
    }

    _transition(addClass, removeClass, removeActiveAfter = false) {
      return new Promise(resolve => {
        let resolved = false;
        const cleanup = () => {
          if (resolved) return;
          resolved = true;
          this.overlay.removeEventListener('transitionend', onEnd);
          this.overlay.classList.remove(addClass, removeClass);
          if (removeActiveAfter) this.overlay.classList.remove(this.activeClass);
          resolve();
        };
        const onEnd = e => {
          if (e.target !== this.overlay) return;
          if (e.propertyName !== 'opacity') return;
          cleanup();
        };
        this.overlay.addEventListener('transitionend', onEnd, { once: true });
        void this.overlay.offsetWidth;
        this.overlay.classList.add(this.activeClass, addClass);
        this.overlay.classList.remove(removeClass);
        const style = getComputedStyle(this.overlay);
        const durationList = style.transitionDuration.split(',');
        const delayList = style.transitionDelay.split(',');
        let maxTime = 0;
        durationList.forEach((d, i) => {
          const duration = parseFloat(d) * (d.includes('ms') ? 1 : 1000);
          const delay = parseFloat(delayList[i] || delayList[0]) * ((delayList[i] || delayList[0]).includes('ms') ? 1 : 1000);
          maxTime = Math.max(maxTime, duration + delay);
        });
        const fallback = maxTime + 100;
        setTimeout(cleanup, fallback);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new PageTransitionController().init();
  });
})();