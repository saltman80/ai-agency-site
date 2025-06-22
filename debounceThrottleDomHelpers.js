const isCollection = obj => {
  if (!obj || typeof obj === 'string') return false;
  if (Array.isArray(obj) || obj instanceof NodeList || obj instanceof HTMLCollection) return true;
  if (typeof obj.length === 'number') {
    if (obj.length === 0) return true;
    if (0 in obj) return true;
  }
  return false;
};

const debounce = (fn, wait = 0, immediate = false) => {
  let timeout = null;
  let lastArgs, lastThis, result;
  const debounced = function(...args) {
    lastArgs = args;
    lastThis = this;
    const later = () => {
      timeout = null;
      if (!immediate) {
        result = fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      result = fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
    return result;
  };
  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
    lastArgs = lastThis = null;
  };
  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      if (!immediate) {
        result = fn.apply(lastThis, lastArgs);
      }
      timeout = null;
      lastArgs = lastThis = null;
      return result;
    }
  };
  return debounced;
};

const throttle = (fn, wait = 0) => {
  let timeout = null;
  let lastArgs, lastThis, result;
  let lastTime = 0;
  const throttled = function(...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);
    lastArgs = args;
    lastThis = this;
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastTime = now;
      result = fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now();
        timeout = null;
        result = fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
      }, remaining);
    }
    return result;
  };
  throttled.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
    lastArgs = lastThis = null;
  };
  throttled.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      lastTime = Date.now();
      result = fn.apply(lastThis, lastArgs);
      timeout = null;
      lastArgs = lastThis = null;
      return result;
    }
  };
  return throttled;
};

const ready = fn => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

const qs = (selector, scope = document) => scope.querySelector(selector);

const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const on = (target, type, handler, options) => {
  if (isCollection(target)) {
    target.forEach(el => el.addEventListener(type, handler, options));
  } else {
    target.addEventListener(type, handler, options);
  }
};

const off = (target, type, handler, options) => {
  if (isCollection(target)) {
    target.forEach(el => el.removeEventListener(type, handler, options));
  } else {
    target.removeEventListener(type, handler, options);
  }
};

const addClass = (target, className) => {
  if (isCollection(target)) {
    target.forEach(el => el.classList.add(className));
  } else {
    target.classList.add(className);
  }
};

const removeClass = (target, className) => {
  if (isCollection(target)) {
    target.forEach(el => el.classList.remove(className));
  } else {
    target.classList.remove(className);
  }
};

const toggleClass = (target, className) => {
  if (isCollection(target)) {
    target.forEach(el => el.classList.toggle(className));
  } else {
    target.classList.toggle(className);
  }
};

const hasClass = (target, className) => {
  if (isCollection(target)) {
    return Array.from(target).every(el => el.classList.contains(className));
  } else {
    return target.classList.contains(className);
  }
};

const setAttr = (target, attr, value) => {
  if (isCollection(target)) {
    target.forEach(el => el.setAttribute(attr, value));
  } else {
    target.setAttribute(attr, value);
  }
};

const removeAttr = (target, attr) => {
  if (isCollection(target)) {
    target.forEach(el => el.removeAttribute(attr));
  } else {
    target.removeAttribute(attr);
  }
};

const css = (target, properties) => {
  if (isCollection(target)) {
    target.forEach(el => Object.assign(el.style, properties));
  } else {
    Object.assign(target.style, properties);
  }
};

const createEl = (tag, attributes = {}, styles = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([attr, value]) => el.setAttribute(attr, value));
  Object.assign(el.style, styles);
  children.forEach(child => {
    if (typeof child === 'string') {
      el.textContent = child;
    } else {
      el.appendChild(child);
    }
  });
  return el;
};

export { debounce, throttle, ready, qs, qsa, on, off, addClass, removeClass, toggleClass, hasClass, setAttr, removeAttr, css, createEl };