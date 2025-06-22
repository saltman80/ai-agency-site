(function() {
  const INTERVAL = 10000;

  function createStraightBeam(angle) {
    const beam = document.createElement('div');
    beam.className = 'laser-beam';
    beam.style.setProperty('--angle', angle + 'deg');
    beam.style.setProperty('--duration', (0.7 + Math.random() * 0.3) + 's');
    document.body.appendChild(beam);
    beam.addEventListener('animationend', () => beam.remove());
  }

  function createLightningBeam() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('lightning-beam');
    svg.setAttribute('width', window.innerWidth);
    svg.setAttribute('height', window.innerHeight);

    const poly = document.createElementNS(svgNS, 'polyline');
    const segments = 20;
    const step = window.innerWidth / segments;
    const amplitude = 40;
    const startY = window.innerHeight * (0.1 + Math.random() * 0.8);

    const points = [];
    let y = startY;
    for (let i = 0; i <= segments; i++) {
      const x = i * step;
      points.push([x, y]);
      if (i < segments) {
        y += (Math.random() - 0.5) * amplitude;
      }
    }

    poly.setAttribute('points', points.map(p => p.join(',')).join(' '));
    svg.appendChild(poly);
    document.body.appendChild(svg);

    const length = poly.getTotalLength();
    const duration = 1.5 + Math.random() * 0.5;
    poly.style.strokeDasharray = length;
    poly.style.strokeDashoffset = length;
    poly.style.animation = `lightning-draw ${duration}s linear forwards`;

    poly.addEventListener('animationend', () => svg.remove());
  }

  function launchBeam() {
    const angle = Math.random() * 360;
    const lightning = Math.random() < 0.5;
    if (lightning) {
      createLightningBeam();
    } else {
      createStraightBeam(angle);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    launchBeam();
    setInterval(launchBeam, INTERVAL);
  });
})();
