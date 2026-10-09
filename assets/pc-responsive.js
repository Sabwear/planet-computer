(() => {
  const banner = document.querySelector('[data-cookie-banner]');
  if (!banner) return;
  // Keep fixed contact controls and the footer clear of both collapsed and expanded consent.
  const update = () => {
    const height = banner.hidden ? 0 : Math.ceil(banner.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--pc-cookie-offset', `${height}px`);
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(update).observe(banner);
  new MutationObserver(update).observe(banner, { attributes: true, attributeFilter: ['hidden'] });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
