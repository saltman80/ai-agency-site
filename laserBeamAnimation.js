(function() {
  const MIN_INTERVAL = 3000;
  const MAX_INTERVAL = 4000;
  const INITIAL_DELAY = 500;

  function createStraightBeam(angle) {
    const beam = document.createElement('div');
    beam.className = 'laser-beam';
    beam.style.setProperty('--angle', angle + 'deg');
    beam.style.setProperty('--duration', (0.7 + Math.random() * 0.3) + 's');
    document.body.appendChild(beam);
    beam.addEventListener('animationend', (e) => {
      if (e.animationName === 'laser-fade') {
        beam.remove();
      }
    });
  }


  function launchBeams() {
    createStraightBeam(-45);
    createStraightBeam(45);
  }

  function scheduleNext() {
    const timeout = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    setTimeout(() => {
      launchBeams();
      scheduleNext();
    }, timeout);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      launchBeams();
      scheduleNext();
    }, INITIAL_DELAY);
  });
})();
