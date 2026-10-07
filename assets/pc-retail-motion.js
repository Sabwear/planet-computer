/* Visible by default. Observe only cosmetic entrances; honor live motion preferences. */
(() => {
  if (window.pcRetailMotion) return;
  window.pcRetailMotion = true;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const attach = (root = document) => {
    if (preference.matches || !('IntersectionObserver' in window)) return;
    observer ||= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('pc-reveal-arrived');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    root.querySelectorAll('.pc-section:not([data-pc-motion])').forEach((section) => {
      section.dataset.pcMotion = 'observed';
      observer.observe(section);
    });
  };
  preference.addEventListener('change', () => {
    observer?.disconnect();
    observer = undefined;
    document.querySelectorAll('[data-pc-motion]').forEach((section) => {
      delete section.dataset.pcMotion;
      section.classList.remove('pc-reveal-arrived');
    });
    attach();
  });
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target.querySelector('.pc-section');
    if (section) delete section.dataset.pcMotion;
    attach(event.target);
  });
  attach();
})();
