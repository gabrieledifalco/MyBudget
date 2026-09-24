// Navigazione del deck: frecce, spazio, click sui controlli, hash nell'URL.
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const counter = document.getElementById('counter');
  let index = 0;

  function show(next) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    counter.textContent = `${index + 1} / ${slides.length}`;
    history.replaceState(null, '', `#${index + 1}`);
  }

  document.getElementById('prev').addEventListener('click', () => show(index - 1));
  document.getElementById('next').addEventListener('click', () => show(index + 1));

  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      show(index + 1);
    }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      show(index - 1);
    }
    if (e.key === 'Home') show(0);
    if (e.key === 'End') show(slides.length - 1);
  });

  // Apertura diretta su una slide: index.html#4
  const fromHash = parseInt(location.hash.slice(1), 10);
  show(Number.isNaN(fromHash) ? 0 : fromHash - 1);
})();
