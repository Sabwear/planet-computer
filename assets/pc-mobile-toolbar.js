(() => {
  const toolbar = document.querySelector('.pc-mobile-toolbar');
  if (!toolbar) return;
  const cartLink = toolbar.querySelector('[data-mobile-cart]');
  const drawer = document.querySelector('cart-drawer');
  if (drawer && typeof drawer.open === 'function') {
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      drawer.open(cartLink);
    });
  }
  toolbar.querySelector('[data-mobile-search]')?.addEventListener('click', (event) => {
    const input = document.querySelector('.pc-header input[type="search"]');
    if (!input) return;
    event.preventDefault();
    input.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    input.focus({ preventScroll: true });
  });
  const header = document.querySelector('pc-header');
  if (header) {
    const updateCount = () => {
      const nativeCount = header.querySelector('.pc-cart-count');
      const badge = toolbar.querySelector('[data-mobile-cart-count]');
      badge.hidden = !nativeCount;
      badge.textContent = nativeCount?.querySelector('[aria-hidden="true"]')?.textContent || '';
      toolbar.querySelector('[data-mobile-cart-description]').textContent = nativeCount?.querySelector('.visually-hidden')?.textContent || '';
    };
    new MutationObserver(updateCount).observe(header, { childList: true, subtree: true, characterData: true });
    updateCount();
  }
})();
