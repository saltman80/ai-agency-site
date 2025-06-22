const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

function sequence(steps) {
  return steps.reduce((promise, step) => promise.then(() => step()), Promise.resolve());
}

function animate(el, props, opts = {}) {
  const {
    duration = 400,
    easing = easeOutCubic,
    delay = 0,
    onUpdate = () => {},
    onComplete = () => {}
  } = opts;
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!(element instanceof Element)) {
    return Promise.reject(new Error(`animate: Element not found or invalid: ${el}`));
  }
  const computedStyle = window.getComputedStyle(element);
  const initial = {};
  const final = {};
  const units = {};
  Object.keys(props).forEach(key => {
    const dashKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    const computedVal = computedStyle.getPropertyValue(dashKey);
    const fromMatch = String(computedVal).match(/(-?[\d.]+)([a-z%]*)/i) || ['', '0', ''];
    const toMatch = String(props[key]).match(/(-?[\d.]+)([a-z%]*)/i) || ['', '0', ''];
    const fromValue = parseFloat(fromMatch[1]) || 0;
    const toValue = parseFloat(toMatch[1]) || 0;
    const fromUnit = fromMatch[2] || '';
    const toUnit = toMatch[2] || '';
    if (fromUnit && toUnit && fromUnit !== toUnit) {
      console.warn(`animate: unit mismatch for "${key}": from "${fromUnit}" to "${toUnit}". Animation may be invalid.`);
    }
    initial[key] = fromValue;
    final[key] = toValue;
    units[key] = toUnit || fromUnit;
  });
  let cancelled = false;
  let rafId = null;
  let timeoutId = null;
  let resolvePromise;
  let rejectPromise;
  const animationPromise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
    if (duration <= 0) {
      const applyEnd = () => {
        if (cancelled) return;
        Object.keys(final).forEach(key => {
          element.style[key] = final[key] + units[key];
        });
        try {
          onUpdate(1, 1);
        } catch (e) {
          console.error('onUpdate callback error', e);
        }
        try {
          onComplete();
        } catch (e) {
          console.error('onComplete callback error', e);
        }
        resolve();
      };
      if (delay > 0) {
        timeoutId = setTimeout(applyEnd, delay);
      } else {
        applyEnd();
      }
      return;
    }
    let startTime = null;
    const frame = now => {
      if (cancelled) return;
      if (!startTime) {
        startTime = now;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);
      Object.keys(initial).forEach(key => {
        const value = initial[key] + (final[key] - initial[key]) * eased;
        element.style[key] = value + units[key];
      });
      try {
        onUpdate(eased, progress);
      } catch (e) {
        console.error('onUpdate callback error', e);
      }
      if (progress < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        try {
          onComplete();
        } catch (e) {
          console.error('onComplete callback error', e);
        }
        resolve();
      }
    };
    const startAnimation = () => {
      if (cancelled) return;
      rafId = requestAnimationFrame(frame);
    };
    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  });
  animationPromise.cancel = () => {
    if (!cancelled) {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
      rejectPromise(new Error('Animation cancelled'));
    }
  };
  return animationPromise;
}

export { easeOutCubic, easeInOutQuad, sequence, animate }