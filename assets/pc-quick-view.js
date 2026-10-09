/* Server-rendered native product data; no catalog copies or stale inventory cache. */
if (!customElements.get('pc-quick-view')) {
  customElements.define('pc-quick-view', class extends HTMLElement {
    connectedCallback() {
      this.events = new AbortController();
      const options = { signal: this.events.signal };
      this.dialog = this.querySelector('dialog');
      this.body = this.querySelector('[data-quick-view-body]');
      this.status = this.querySelector('[data-quick-view-status]');
      if (!this.dialog.showModal) return;
      const enable = (root = document) => root.querySelectorAll('[data-pc-quick-view]').forEach(button => { button.hidden = false; });
      enable();
      document.addEventListener('shopify:section:load', event => enable(event.target), options);
      this.observer = new MutationObserver(() => enable());
      this.observer.observe(document.getElementById('MainContent'), { childList: true, subtree: true });
      document.addEventListener('click', event => {
        const trigger = event.target.closest('[data-pc-quick-view]');
        if (!trigger) return;
        this.open(trigger);
      }, options);
      this.querySelector('[data-quick-view-close]').addEventListener('click', () => this.dialog.close(), options);
      this.dialog.addEventListener('click', event => {
        if (event.target !== this.dialog) return;
        const rect = this.dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dialog.close();
      }, options);
      this.dialog.addEventListener('close', () => {
        this.request?.abort();
        document.body.classList.remove('pc-quick-view-open');
        this.trigger?.focus();
      }, options);
      this.dialog.addEventListener('submit', () => this.dialog.close(), { ...options, capture: true });
    }
    async open(trigger) {
      this.trigger = trigger;
      this.request?.abort();
      this.request = new AbortController();
      this.body.replaceChildren();
      const heading = document.createElement('h2');
      heading.id = 'PCQuickViewTitle'; heading.textContent = trigger.textContent;
      this.body.append(heading);
      this.status.textContent = this.status.dataset.loading;
      this.dialog.showModal();
      document.body.classList.add('pc-quick-view-open');
      try {
        const url = new URL(trigger.dataset.pcQuickView, location.origin);
        if (url.origin !== location.origin) throw new Error('Invalid product URL');
        url.searchParams.set('section_id', 'pc-quick-view');
        const response = await fetch(url, { signal: this.request.signal });
        if (!response.ok) throw new Error('Product could not load');
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const content = doc.querySelector('[data-quick-view-content]');
        if (!content) throw new Error('No product content');
        content.querySelectorAll('script').forEach(script => script.remove());
        if (trigger.hasAttribute('data-hide-price')) content.querySelector('[data-quick-view-price]')?.remove();
        this.body.replaceChildren(content);
        this.status.textContent = '';
      } catch (error) {
        if (error.name === 'AbortError') return;
        this.status.textContent = this.status.dataset.failure;
        const link = document.createElement('a');
        link.href = trigger.dataset.pcQuickView;
        link.textContent = trigger.getAttribute('aria-label');
        this.body.append(link);
      }
    }
    disconnectedCallback() { this.events?.abort(); this.request?.abort(); this.observer?.disconnect(); }
  });
}
