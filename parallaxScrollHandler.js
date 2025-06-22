function debounce(func, wait = 100, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class ParallaxScrollHandler {
  constructor() {
    this.items = [];
    this.enabled = false;
    this.ticking = false;
    this.handleScroll = this.handleScroll.bind(this);
    this.handleResize = debounce(() => {
      this.recalculate();
      this.update();
    }, 200);
  }

  init() {
    this.items = Array.from(document.querySelectorAll('[data-parallax-speed]')).map(el => ({
      el,
      speed: parseFloat(el.getAttribute('data-parallax-speed')) || 0,
      offsetTop: 0,
      height: 0
    }));
    this.recalculate();
    this.update();
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }

  recalculate() {
    const width = window.innerWidth;
    this.enabled = width > 768;
    this.items.forEach(item => {
      const { el } = item;
      item.offsetTop = el.offsetTop;
      item.height = el.offsetHeight;
      if (!this.enabled) {
        el.style.transform = '';
      }
    });
  }

  handleScroll() {
    if (!this.enabled) return;
    if (!this.ticking) {
      this.ticking = true;
      window.requestAnimationFrame(() => {
        this.update();
        this.ticking = false;
      });
    }
  }

  update() {
    if (!this.enabled) return;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const vh = window.innerHeight;
    this.items.forEach(item => {
      const { el, speed, offsetTop, height } = item;
      const start = offsetTop - vh;
      const end = offsetTop + height;
      if (scrollY > start && scrollY < end) {
        const y = (scrollY - offsetTop) * speed;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      } else {
        el.style.transform = '';
      }
    });
  }
}

const parallaxScrollHandler = new ParallaxScrollHandler();
parallaxScrollHandler.init();