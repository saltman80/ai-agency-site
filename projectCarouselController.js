(function() {
  const AUTO_PLAY_INTERVAL = 5000;
  let currentIndex = 0;
  let projects = [];
  let autoInterval = null;
  let isHovered = false;
  let carousel = null;
  let track = null;
  let prevBtn = null;
  let nextBtn = null;

  document.addEventListener('DOMContentLoaded', () => {
    carousel = document.querySelector('.projects-carousel');
    if (!carousel) {
      console.error('Carousel element .projects-carousel not found.');
      return;
    }
    track = carousel.querySelector('.carousel-track');
    prevBtn = carousel.querySelector('.carousel-button--prev');
    nextBtn = carousel.querySelector('.carousel-button--next');
    if (!track || !prevBtn || !nextBtn) {
      console.error('Carousel track or buttons not found.');
      return;
    }

    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
    carousel.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoplay();
    });
    carousel.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoplay();
    });
    document.addEventListener('keydown', onKeydown);
    addSwipeSupport();

    init();
  });

  async function init() {
    projects = await loadData('data/projects.json');
    if (!projects.length) return;
    renderSlides();
  }

  function loadData(url) {
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
        return res.json();
      })
      .catch(err => {
        console.error('Error loading carousel data:', err);
        return [];
      });
  }

  function renderSlides() {
    track.innerHTML = '';
    projects.forEach((project, index) => {
      const slide = document.createElement('li');
      slide.className = 'carousel-slide';
      slide.style.left = `${index * 100}%`;

      const content = document.createElement('div');
      content.className = 'slide-content glassmorphism';

      const title = document.createElement('h3');
      title.className = 'project-title neon-text';
      title.textContent = project.title || '';

      const description = document.createElement('p');
      description.className = 'project-description';
      description.textContent = project.description || '';

      content.appendChild(title);
      content.appendChild(description);

      if (project.url) {
        try {
          const safeUrl = new URL(project.url, window.location.href);
          const link = document.createElement('a');
          link.className = 'project-link neon-text';
          link.href = safeUrl.href;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = 'View Project';
          content.appendChild(link);
        } catch (e) {
          console.warn('Invalid URL in project:', project.url);
        }
      }

      slide.appendChild(content);
      track.appendChild(slide);
    });

    if (projects.length > 1) {
      track.style.width = `${projects.length * 100}%`;
      showSlide(0, false);
      startAutoplay();
    } else {
      track.style.width = '100%';
      showSlide(0, false);
    }
  }

  function showSlide(index, animate = true) {
    if (!track) return;
    const count = projects.length;
    if (!count) return;
    currentIndex = ((index % count) + count) % count;
    track.style.transition = animate ? 'transform 0.5s ease-in-out' : 'none';
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function navigate(direction) {
    stopAutoplay();
    showSlide(currentIndex + direction);
    startAutoplay();
  }

  function startAutoplay() {
    if (projects.length <= 1) return;
    stopAutoplay();
    autoInterval = setInterval(() => {
      showSlide(currentIndex + 1);
    }, AUTO_PLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }
  }

  function onKeydown(e) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
    if (!carousel) return;
    if (!isHovered && !carousel.contains(activeEl)) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigate(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigate(1);
    }
  }

  function addSwipeSupport() {
    if (!carousel) return;
    let startX = 0;
    carousel.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      const dx = startX - endX;
      if (Math.abs(dx) > 50) {
        dx > 0 ? navigate(1) : navigate(-1);
      }
    });
  }
})();