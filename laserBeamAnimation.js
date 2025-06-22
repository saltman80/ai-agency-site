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
    const container = document.createElement('div');
    container.className = 'lightning-bolt';
    container.style.left = (10 + Math.random() * 80) + 'vw';
    container.style.top = '-5%';

    const segCount = 3 + Math.floor(Math.random() * 3);
    let offset = 0;
    for (let i = 0; i < segCount; i++) {
      const seg = document.createElement('div');
      seg.className = 'segment';
      const length = 60 + Math.random() * 40;
      const angle = (Math.random() * 40) - 20;
      seg.style.setProperty('--length', length + 'px');
      seg.style.setProperty('--angle', angle + 'deg');
      seg.style.setProperty('--offset', offset + 'px');
      seg.style.setProperty('--delay', (i * 0.1) + 's');
      container.appendChild(seg);
      offset += Math.cos(angle * Math.PI / 180) * length;
    }
    container.style.height = offset + 'px';

    document.body.appendChild(container);
    const last = container.lastElementChild;
    last.addEventListener('animationend', () => container.remove());
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
