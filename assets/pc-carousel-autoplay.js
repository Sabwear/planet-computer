document.querySelectorAll('pc-carousel[data-autoplay]').forEach((carousel) => {
  const options = {};
  carousel.row = carousel.querySelector('[data-row]');
  carousel.previous = carousel.querySelector('[data-prev]');
  carousel.next = carousel.querySelector('[data-next]');
  if (!carousel.row || !carousel.previous || !carousel.next) return;

        carousel.paused = false;
        carousel.visible = false;
        carousel.hovered = false;
        carousel.motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
        carousel.pauseButton = carousel.querySelector('[data-autoplay-toggle]');
        const pause = () => {
          carousel.paused = true;
          carousel.pauseButton?.setAttribute('aria-pressed', 'true');
          carousel.pauseButton?.setAttribute('aria-label', 'Reprendre le défilement automatique');
          if (carousel.pauseButton) carousel.pauseButton.textContent = 'Reprendre';
        };
        carousel.pauseButton?.addEventListener('click', () => {
          if (!carousel.paused) return pause();
          carousel.paused = false;
          carousel.pauseButton.setAttribute('aria-pressed', 'false');
          carousel.pauseButton.setAttribute('aria-label', 'Mettre en pause le défilement automatique');
          carousel.pauseButton.textContent = 'Pause';
        }, options);
        carousel.previous.addEventListener('click', pause, options);
        carousel.next.addEventListener('click', pause, options);
        carousel.row.addEventListener('pointerdown', pause, options);
        carousel.row.addEventListener('keydown', pause, options);
        carousel.addEventListener('pointerenter', () => { carousel.hovered = true; }, options);
        carousel.addEventListener('pointerleave', () => { carousel.hovered = false; }, options);
        carousel.visibilityObserver = new IntersectionObserver(([entry]) => { carousel.visible = entry.isIntersecting; }, {threshold: 0.25});
        carousel.visibilityObserver.observe(carousel.row);
        carousel.timer = setInterval(() => {
          if (carousel.paused || carousel.hovered || !carousel.visible || document.hidden || carousel.motionQuery.matches || carousel.contains(document.activeElement)) return;
          const max = carousel.row.scrollWidth - carousel.row.clientWidth;
          if (max <= 2) return;
          const rtl = getComputedStyle(carousel.row).direction === 'rtl';
          const step = (carousel.row.firstElementChild?.getBoundingClientRect().width || carousel.row.clientWidth) + (parseFloat(getComputedStyle(carousel.row).columnGap) || 0);
          if (Math.abs(carousel.row.scrollLeft) >= max - 2) carousel.row.scrollTo({left: 0, behavior: 'smooth'});
          else carousel.row.scrollBy({left: step * (rtl ? -1 : 1), behavior: 'smooth'});
        }, 5000);
});
