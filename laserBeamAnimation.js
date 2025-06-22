(function() {
  const COLOR = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#00e5ff';
  const INTERVAL = 10000;

  function createStraightBeam(angle) {
    const beam = document.createElement('div');
    beam.className = 'laser-beam';
    beam.style.setProperty('--angle', angle + 'deg');
    beam.style.setProperty('--duration', (0.7 + Math.random() * 0.3) + 's');
    document.body.appendChild(beam);
    beam.addEventListener('animationend', () => beam.remove());
  }

  function createLightningBeam(angle) {
    const container = document.createElement('div');
    container.className = 'laser-beam lightning';
    container.style.setProperty('--angle', angle + 'deg');
    container.style.setProperty('--duration', (0.8 + Math.random() * 0.4) + 's');

    const segCount = 3 + Math.floor(Math.random() * 3);
    let offset = 0;
    for (let i = 0; i < segCount; i++) {
      const seg = document.createElement('div');
      seg.className = 'segment';
      const length = 60 + Math.random() * 40;
      const skew = (Math.random() * 20) - 10;
      seg.style.width = length + 'px';
      seg.style.left = offset + 'px';
      seg.style.transform = `rotate(${skew}deg)`;
      container.appendChild(seg);
      offset += length;
    }
    container.style.width = offset + 'px';

    document.body.appendChild(container);
    container.addEventListener('animationend', () => container.remove());
  }

  function launchBeam() {
    const angle = Math.random() * 360;
    const lightning = Math.random() < 0.3;
    if (lightning) {
      createLightningBeam(angle);
    } else {
      createStraightBeam(angle);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    launchBeam();
    setInterval(launchBeam, INTERVAL);
  });
})();
