const selector = 'section#projects a[href$=".ai"]';
    const fallbackDefault = 'AI file coming soon';
    const timeoutDefault = 5000;
    const supportsAbort = typeof AbortController === 'function';
    const links = Array.from(document.querySelectorAll(selector));

    for (const link of links) {
      let controller, timer, fetchPromise;
      if (supportsAbort) {
        controller = new AbortController();
        timer = setTimeout(() => controller.abort(), timeoutDefault);
        fetchPromise = fetch(link.href, { method: 'HEAD', signal: controller.signal });
      } else {
        fetchPromise = fetch(link.href, { method: 'HEAD' });
      }

      try {
        let response;
        if (supportsAbort) {
          response = await fetchPromise;
        } else {
          response = await Promise.race([
            fetchPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutDefault))
          ]);
        }
        if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      } catch (err) {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.setAttribute('tabindex', '-1');
        const text = link.dataset.fallback || fallbackDefault;
        link.textContent = text;
        link.classList.add('ai-file-missing');
      } finally {
        if (supportsAbort && timer) clearTimeout(timer);
      }
    }
  });
})();