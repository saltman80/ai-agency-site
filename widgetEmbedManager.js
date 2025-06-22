class WidgetEmbedManager {
  constructor() {
    this.registry = new Map();
    this.scriptLoadMap = new Map();
    this.pending = new Set();
    this.domReady = false;
    this.observer = null;

    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(this._onIntersect.bind(this), {
        rootMargin: '0px',
        threshold: 0
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this._onDomReady.bind(this));
    } else {
      this._onDomReady();
    }
  }

  _onDomReady() {
    this.domReady = true;
    this.pending.forEach(name => this._setupEntry(name));
    this.pending.clear();
  }

  register(name, config) {
    if (this.registry.has(name)) {
      console.warn(`WidgetEmbedManager: widget "${name}" is already registered`);
      return;
    }
    if (typeof config !== 'object' || !config.selector) {
      console.error(`WidgetEmbedManager: invalid config for widget "${name}"`);
      return;
    }
    const entry = {
      config: {
        src: config.src || null,
        selector: config.selector,
        async: config.async !== false,
        defer: config.defer !== false,
        attributes: config.attributes || {},
        init: typeof config.init === 'function' ? config.init : null
      },
      element: null,
      loading: false,
      loaded: false,
      loadingPromise: null
    };
    this.registry.set(name, entry);
    if (this.domReady) {
      this._setupEntry(name);
    } else {
      this.pending.add(name);
    }
  }

  _setupEntry(name) {
    const entry = this.registry.get(name);
    if (!entry) return;
    const el = document.querySelector(entry.config.selector);
    if (!el) {
      console.warn(`WidgetEmbedManager: element "${entry.config.selector}" not found for widget "${name}"`);
      return;
    }
    entry.element = el;
    el.dataset.widgetName = name;
    if (this.observer) {
      this.observer.observe(el);
    } else {
      this.loadWidget(name);
    }
  }

  _onIntersect(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const name = entry.target.dataset.widgetName;
        if (name) {
          this.loadWidget(name);
          this.observer.unobserve(entry.target);
        }
      }
    });
  }

  loadWidget(name) {
    const entry = this.registry.get(name);
    if (!entry) {
      return Promise.reject(new Error(`WidgetEmbedManager: widget "${name}" is not registered`));
    }
    if (entry.loaded) {
      return Promise.resolve();
    }
    if (entry.loading) {
      return entry.loadingPromise;
    }
    entry.loading = true;
    entry.loadingPromise = new Promise((resolve, reject) => {
      const { src, async, defer, attributes, init } = entry.config;
      const onLoad = () => {
        entry.loaded = true;
        entry.loading = false;
        if (typeof init === 'function') {
          try {
            init(entry.element);
          } catch (err) {
            console.error(`WidgetEmbedManager: init callback error for "${name}"`, err);
          }
        }
        const event = new CustomEvent('widgetLoaded', { detail: { name } });
        entry.element.dispatchEvent(event);
        resolve();
      };
      const onError = err => {
        entry.loading = false;
        const event = new CustomEvent('widgetError', { detail: { name, error: err } });
        entry.element.dispatchEvent(event);
        reject(err);
      };
      if (src) {
        const loadInfo = this.scriptLoadMap.get(src);
        if (loadInfo) {
          loadInfo.refCount++;
          loadInfo.promise.then(onLoad).catch(onError);
        } else {
          const script = document.createElement('script');
          script.src = src;
          script.async = async;
          script.defer = defer;
          Object.keys(attributes).forEach(key => {
            script.setAttribute(key, attributes[key]);
          });
          const loadPromise = new Promise((scriptResolve, scriptReject) => {
            script.onload = () => scriptResolve();
            script.onerror = e => {
              this.scriptLoadMap.delete(src);
              if (script.parentNode) {
                script.parentNode.removeChild(script);
              }
              scriptReject(e);
            };
          });
          this.scriptLoadMap.set(src, { promise: loadPromise, scriptElement: script, refCount: 1 });
          loadPromise.then(onLoad).catch(onError);
          document.head.appendChild(script);
        }
      } else {
        setTimeout(onLoad, 0);
      }
    });
    return entry.loadingPromise;
  }

  loadAll() {
    const promises = [];
    this.registry.forEach((_, name) => {
      promises.push(this.loadWidget(name));
    });
    return Promise.all(promises);
  }

  destroyWidget(name) {
    const entry = this.registry.get(name);
    if (!entry) return;
    if (this.observer && entry.element) {
      this.observer.unobserve(entry.element);
    }
    if (entry.element) {
      entry.element.removeAttribute('data-widget-name');
      entry.element.innerHTML = '';
      const destroyedEvent = new CustomEvent('widgetDestroyed', { detail: { name } });
      entry.element.dispatchEvent(destroyedEvent);
    }
    const src = entry.config.src;
    if (src) {
      const loadInfo = this.scriptLoadMap.get(src);
      if (loadInfo) {
        loadInfo.refCount--;
        if (loadInfo.refCount <= 0) {
          if (loadInfo.scriptElement.parentNode) {
            loadInfo.scriptElement.parentNode.removeChild(loadInfo.scriptElement);
          }
          this.scriptLoadMap.delete(src);
        }
      }
    }
    this.registry.delete(name);
  }

  clearAll() {
    Array.from(this.registry.keys()).forEach(name => this.destroyWidget(name));
  }
}

const widgetEmbedManager = new WidgetEmbedManager();
export default widgetEmbedManager;