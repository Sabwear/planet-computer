if (!customElements.get('pc-carousel')) {
  customElements.define('pc-carousel', class extends HTMLElement {
    connectedCallback() {
      this.controller?.abort();
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
    }
    update() {
      const max = this.row.scrollWidth - this.row.clientWidth;
      const position = Math.abs(this.row.scrollLeft);
      this.controls.hidden = max <= 2;
      this.previous.disabled = position <= 2;
      this.next.disabled = position >= max - 2;
    }
    disconnectedCallback() {this.controller?.abort();this.observer?.disconnect();}
  });
}
