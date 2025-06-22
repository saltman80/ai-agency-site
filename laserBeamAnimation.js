(function() {
  const MIN_INTERVAL = 3000;
  const MAX_INTERVAL = 4000;
  const INITIAL_DELAY = 500;

  function createLightningBeam() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('lightning-beam');
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);

    const polyline = document.createElementNS(svgNS, 'polyline');
    svg.appendChild(polyline);

    const vertical = Math.random() < 0.5;
    const segments = 15;
    const points = [];
    if (vertical) {
      let x = Math.random() * window.innerWidth;
      let y = 0;
      const step = window.innerHeight / segments;
      points.push(`${x},${y}`);
      for (let i = 1; i <= segments; i++) {
        y = step * i;
        x += (Math.random() - 0.5) * step;
        points.push(`${x},${y}`);
      }
    } else {
      let y = Math.random() * window.innerHeight;
      let x = 0;
      const step = window.innerWidth / segments;
      points.push(`${x},${y}`);
      for (let i = 1; i <= segments; i++) {
        x = step * i;
        y += (Math.random() - 0.5) * step;
        points.push(`${x},${y}`);
      }
    }

    polyline.setAttribute('points', points.join(' '));
    document.body.appendChild(svg);

    const length = polyline.getTotalLength();
    polyline.style.strokeDasharray = length;
    polyline.style.strokeDashoffset = length;
    const drawDuration = 0.8 + Math.random() * 0.4;
    polyline.style.animation =
      `lightning-draw ${drawDuration}s linear forwards, ` +
      `lightning-fade 2s ${drawDuration}s linear forwards`;

    polyline.addEventListener('animationend', (e) => {
      if (e.animationName === 'lightning-fade') {
        svg.remove();
      }
    });
  }

  function launchBeam() {
    createLightningBeam();
  }

  function scheduleNext() {
    const timeout = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    setTimeout(() => {
      launchBeam();
      scheduleNext();
    }, timeout);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      launchBeam();
      scheduleNext();
    }, INITIAL_DELAY);
  });
})();
