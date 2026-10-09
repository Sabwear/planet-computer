/* Native details navigation; modal mobile drawer is progressive enhancement. */
if (!customElements.get('pc-header')) {
  customElements.define('pc-header', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
      const utility = this.querySelector('.pc-desktop-nav--utilities');
      const section = this.closest('.pc-header-section');
      if (utility && section && this.classList.contains('pc-header--sticky')) {
        const measure = () => section.style.setProperty('--pc-utility-height', `${utility.getBoundingClientRect().height}px`);
        this.utilityObserver = new ResizeObserver(measure);
        this.utilityObserver.observe(utility);
        measure();
      }
      this.dialog = this.querySelector('dialog');
      this.trigger = this.querySelector('[data-menu-open]');
      this.fallback = this.querySelector('[data-menu-fallback]');
      this.desktopQuery = window.matchMedia('(min-width: 1024px)');
      if (this.dialog && typeof this.dialog.showModal === 'function') {
        this.trigger.hidden = false;
        this.fallback.hidden = true;
        this.trigger.addEventListener('click', () => {
          this.dialog.showModal();
          this.trigger.setAttribute('aria-expanded', 'true');
          document.body.classList.add('pc-menu-open');
        }, options);
        this.querySelector('[data-menu-close]').addEventListener('click', () => this.dialog.close(), options);
        this.dialog.addEventListener('keydown', (event) => {
          if (event.key !== 'Tab') return;
          const focusable = Array.from(this.dialog.querySelectorAll('button:not(:disabled), a[href], summary, input:not(:disabled), [tabindex]:not([tabindex="-1"])'))
            .filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }, options);
        this.dialog.addEventListener('close', () => {
          this.trigger.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('pc-menu-open');
          if (!this.desktopQuery.matches) this.trigger.focus();
        }, options);
        this.dialog.addEventListener('click', (event) => {
          if (event.target !== this.dialog) return;
          const bounds = this.dialog.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) this.dialog.close();
        }, options);
        this.desktopQuery.addEventListener('change', (event) => {
          if (event.matches && this.dialog.open) this.dialog.close();
        }, options);
      }
      this.querySelectorAll('.pc-mega').forEach((details) => {
        details.addEventListener('toggle', () => {
          if (details.open) this.querySelectorAll('.pc-mega[open]').forEach((other) => { if (other !== details) other.open = false; });
        }, options);
        details.addEventListener('keydown', (event) => {
          if (event.key === 'Escape' && details.open) {
            details.open = false;
            details.querySelector('summary').focus();
            event.preventDefault();
          }
        }, options);
      });
      document.addEventListener('click', (event) => {
        this.querySelectorAll('.pc-mega[open]').forEach((details) => { if (!details.contains(event.target)) details.open = false; });
      }, options);
    }
    disconnectedCallback() {
      this.controller?.abort();
      this.utilityObserver?.disconnect();
      if (this.dialog?.open) this.dialog.close();
      document.body.classList.remove('pc-menu-open');
    }
  });
}
