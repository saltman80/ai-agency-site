class AssetLoader {
  constructor(concurrency = 4) {
    this.concurrency = concurrency;
    this.active = 0;
    this.queue = [];
    this.cache = new Map();
  }

  load(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    const promise = new Promise((resolve, reject) => {
      const task = () => {
        this.active++;
        fetch(url).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load ${url}`);
          }
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            return response.json();
          }
          if (ct.startsWith('text/') || /\.(txt|md|csv)$/i.test(url)) {
            return response.text();
          }
          return response.blob();
        }).then(data => {
          resolve(data);
        }).catch(err => {
          this.cache.delete(url);
          reject(err);
        }).finally(() => {
          this.active--;
          this.next();
        });
      };
      this.queue.push(task);
      this.next();
    });
    this.cache.set(url, promise);
    return promise;
  }

  preload(urls) {
    return Promise.all(urls.map(url => this.load(url)));
  }

  next() {
    if (this.active >= this.concurrency) {
      return;
    }
    const task = this.queue.shift();
    if (task) {
      task();
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

class PreloadLazyLoadManager {
  constructor(options = {}) {
    this.options = Object.assign({
      concurrency: 4,
      lazySelector: '[data-src], [data-srcset], [data-bg], [data-video]',
      preloadSelector: '[data-preload]',
      lazyRoot: null,
      lazyRootMargin: '200px 0px',
      lazyThreshold: 0,
      preloadRoot: null,
      preloadRootMargin: '0px 200px',
      preloadThreshold: 0.1
    }, options);
    this.assetLoader = new AssetLoader(this.options.concurrency);
    this.lazyObserver = null;
    this.preloadObserver = null;
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupLazyObserver();
      this.setupPreloadObserver();
    } else {
      this.loadAllLazy();
      this.preloadAll();
    }
  }

  setupLazyObserver() {
    this.lazyObserver = new IntersectionObserver(this.onLazyIntersect.bind(this), {
      root: this.options.lazyRoot,
      rootMargin: this.options.lazyRootMargin,
      threshold: this.options.lazyThreshold
    });
    this.observeLazyElements();
  }

  observeLazyElements(root = document) {
    root.querySelectorAll(this.options.lazySelector).forEach(el => {
      this.lazyObserver.observe(el);
    });
  }

  onLazyIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadLazyElement(entry.target);
        this.lazyObserver.unobserve(entry.target);
      }
    });
  }

  loadLazyElement(el) {
    if (el.dataset.src) {
      el.src = el.dataset.src;
    }
    if (el.dataset.srcset) {
      el.srcset = el.dataset.srcset;
    }
    if (el.dataset.bg) {
      el.style.backgroundImage = `url(${el.dataset.bg})`;
    }
    if (el.dataset.video) {
      el.src = el.dataset.video;
      el.load();
    }
    delete el.dataset.src;
    delete el.dataset.srcset;
    delete el.dataset.bg;
    delete el.dataset.video;
    el.dispatchEvent(new CustomEvent('lazyloaded', { detail: el }));
  }

  loadAllLazy() {
    document.querySelectorAll(this.options.lazySelector).forEach(el => {
      this.loadLazyElement(el);
    });
  }

  setupPreloadObserver() {
    this.preloadObserver = new IntersectionObserver(this.onPreloadIntersect.bind(this), {
      root: this.options.preloadRoot,
      rootMargin: this.options.preloadRootMargin,
      threshold: this.options.preloadThreshold
    });
    this.observePreloadElements();
  }

  observePreloadElements(root = document) {
    root.querySelectorAll(this.options.preloadSelector).forEach(el => {
      this.preloadObserver.observe(el);
    });
  }

  onPreloadIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const data = entry.target.dataset.preload.trim();
        let urls = [];
        try {
          const parsed = JSON.parse(data);
          urls = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          urls = data.split(/\s+/);
        }
        this.assetLoader.preload(urls);
        this.preloadObserver.unobserve(entry.target);
      }
    });
  }

  preloadAll() {
    document.querySelectorAll(this.options.preloadSelector).forEach(el => {
      const data = el.dataset.preload.trim();
      let urls = [];
      try {
        const parsed = JSON.parse(data);
        urls = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        urls = data.split(/\s+/);
      }
      this.assetLoader.preload(urls);
    });
  }

  destroy() {
    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
      this.lazyObserver = null;
    }
    if (this.preloadObserver) {
      this.preloadObserver.disconnect();
      this.preloadObserver = null;
    }
  }
}

const preloadLazyLoadManager = new PreloadLazyLoadManager();
preloadLazyLoadManager.init();

