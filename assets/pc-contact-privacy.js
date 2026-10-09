(() => {
  const widget = document.querySelector('[data-contact-widget]');
  if (widget) {
    const toggle = widget.querySelector('[data-contact-toggle]');
    const panel = widget.querySelector('#PcContactPanel');
    const close = () => { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => {
      const open = panel.hidden; panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('[data-contact-close]').focus();
    });
    widget.querySelector('[data-contact-close]').addEventListener('click', () => { close(); toggle.focus(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) { close(); toggle.focus(); } });
    document.addEventListener('click', event => { if (!widget.contains(event.target)) close(); });
  }
  const banner = document.querySelector('[data-cookie-banner]');
  if (!banner) return;
  const status = banner.querySelector('[data-cookie-status]');
  const fields = [...banner.querySelectorAll('[data-consent]')];
  const buttons = [...banner.querySelectorAll('[data-cookie-save]')];
  let api; let opener; let saving = false;
  const nativeBanner = () => document.getElementById('shopify-pc__banner');
  const deferToNative = () => { const native = nativeBanner(); if (native && !native.hidden && native.getClientRects().length) banner.hidden = true; };
  if (typeof MutationObserver !== 'undefined') new MutationObserver(deferToNative).observe(document.body, { childList: true, subtree: true });
  const read = () => {
    const consent = api.currentVisitorConsent();
    fields.forEach(field => { field.checked = consent[field.dataset.consent] === 'yes'; });
    return fields.every(field => ['yes', 'no'].includes(consent[field.dataset.consent]));
  };
  const retry = banner.querySelector('[data-cookie-retry]');
  banner.querySelector('[data-cookie-close]').addEventListener('click', () => { banner.hidden = true; opener?.focus(); });
  const error = (stage = 'save') => { banner.dataset.cookieError = stage; if (retry) retry.hidden = false; banner.hidden = false; status.textContent = 'Service indisponible. Aucun choix enregistré.'; };
  const ready = () => {
    api = window.Shopify?.customerPrivacy;
    if (!api) return false;
    try { banner.hidden = read(); deferToNative(); if (retry) retry.hidden = true; status.textContent = ''; delete banner.dataset.cookieError; return true; } catch { error('read'); return true; }
  };
  const init = () => {
    if (ready()) return;
    if (!window.Shopify?.loadFeatures) { error('loader'); return; }
    window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], failure => {
      if (!ready()) { banner.dataset.cookieLoadMessage = String(failure?.message || failure || 'API missing'); error(failure ? 'load-failed' : 'api-missing'); }
    });
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    if (!api || saving) { if (!api) error(); return; }
    const choice = button.dataset.cookieSave;
    const consent = Object.fromEntries(fields.map(field => [field.dataset.consent, choice === 'custom' ? field.checked : choice === 'accept']));
    saving = true; buttons.forEach(item => { item.disabled = true; }); status.textContent = 'Enregistrement…';
    const unlock = () => { saving = false; buttons.forEach(item => { item.disabled = false; }); };
    const timer = setTimeout(() => { unlock(); error(); }, 8000);
    try {
      api.setTrackingConsent(consent, result => {
        clearTimeout(timer); unlock();
        try {
          const actual = api.currentVisitorConsent();
          if (result?.error || !Object.entries(consent).every(([key, value]) => actual[key] === (value ? 'yes' : 'no'))) { error(); return; }
          banner.hidden = true; status.textContent = ''; opener?.focus();
        } catch { error(); }
      });
    } catch { clearTimeout(timer); unlock(); error(); }
  }));
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-cookie-open]'); if (!button) return;
    opener = button;
    const nativePreferences = nativeBanner()?.querySelector('#shopify-pc__banner__btn-manage-prefs');
    if (nativePreferences) { banner.hidden = true; nativePreferences.click(); return; }
    banner.hidden = false; banner.querySelector('[data-cookie-details]').open = true;
    if (api) { try { read(); } catch { error(); } }
    banner.querySelector('summary').focus();
  });
  document.addEventListener('visitorConsentCollected', () => { if (api && !saving) { try { read(); } catch { error(); } } });
  retry?.addEventListener('click', () => { status.textContent = 'Chargement…'; init(); });
  init();
  deferToNative();
})();
