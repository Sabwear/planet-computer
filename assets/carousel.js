if (!customElements.get('pc-carousel')) {
  customElements.define('pc-carousel', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
      clearInterval(this.timer);
      this.visibilityObserver?.disconnect();
      this.controller = new AbortController();
      const options = {signal:this.controller.signal};
      this.row = this.querySelector('[data-row]');
      this.controls = this.querySelector('[data-controls]');
      if (!this.row || !this.controls) return;
      this.previous = this.querySelector('[data-prev]');
      this.next = this.querySelector('[data-next]');
      const move = (direction) => {
        const rtl = getComputedStyle(this.row).direction === 'rtl';
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.row.scrollBy({left:direction * (rtl ? -1 : 1) * this.row.clientWidth, behavior:reduced ? 'auto' : 'smooth'});
      };
      this.previous.addEventListener('click',()=>move(-1),options);
      this.next.addEventListener('click',()=>move(1),options);
      this.row.addEventListener('scroll',()=>this.update(),{...options,passive:true});
      this.observer = new ResizeObserver(()=>this.update());
      this.observer.observe(this.row);
      this.update();
      if (this.hasAttribute('data-autoplay')) {
        this.paused = false;
        this.visible = false;
        this.hovered = false;
        this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
        this.pauseButton = this.querySelector('[data-autoplay-toggle]');
        const pause = () => {
          this.paused = true;
          this.pauseButton?.setAttribute('aria-pressed', 'true');
          this.pauseButton?.setAttribute('aria-label', 'Reprendre le défilement automatique');
          if (this.pauseButton) this.pauseButton.textContent = 'Reprendre';
        };
        this.pauseButton?.addEventListener('click', () => {
          if (!this.paused) return pause();
          this.paused = false;
          this.pauseButton.setAttribute('aria-pressed', 'false');
          this.pauseButton.setAttribute('aria-label', 'Mettre en pause le défilement automatique');
          this.pauseButton.textContent = 'Pause';
        }, options);
        this.previous.addEventListener('click', pause, options);
        this.next.addEventListener('click', pause, options);
        this.row.addEventListener('pointerdown', pause, options);
        this.row.addEventListener('keydown', pause, options);
        this.addEventListener('pointerenter', () => { this.hovered = true; }, options);
        this.addEventListener('pointerleave', () => { this.hovered = false; }, options);
        this.visibilityObserver = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; }, {threshold: 0.25});
        this.visibilityObserver.observe(this.row);
        this.timer = setInterval(() => {
          if (this.paused || this.hovered || !this.visible || document.hidden || this.motionQuery.matches || this.contains(document.activeElement)) return;
          const max = this.row.scrollWidth - this.row.clientWidth;
          if (max <= 2) return;
          const rtl = getComputedStyle(this.row).direction === 'rtl';
          const step = (this.row.firstElementChild?.getBoundingClientRect().width || this.row.clientWidth) + (parseFloat(getComputedStyle(this.row).columnGap) || 0);
          if (Math.abs(this.row.scrollLeft) >= max - 2) this.row.scrollTo({left: 0, behavior: 'smooth'});
          else this.row.scrollBy({left: step * (rtl ? -1 : 1), behavior: 'smooth'});
        }, 5000);
      }
    }
    update() {
      const max = this.row.scrollWidth - this.row.clientWidth;
      const position = Math.abs(this.row.scrollLeft);
      this.controls.hidden = max <= 2;
      this.previous.disabled = position <= 2;
      this.next.disabled = position >= max - 2;
    }
    disconnectedCallback() {this.controller?.abort();this.observer?.disconnect();this.visibilityObserver?.disconnect();clearInterval(this.timer);}
  });
}
