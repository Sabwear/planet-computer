if (!customElements.get('pc-predictive-search')) {
  customElements.define('pc-predictive-search', class extends HTMLElement {
    connectedCallback() {
      this.listeners?.abort();
      this.listeners = new AbortController();
      const options={signal:this.listeners.signal};
      this.input=this.querySelector('input[type="search"]');
      this.results=this.querySelector('[data-pc-results]');
      this.status=this.querySelector('[data-pc-status]');
      this.reset=this.querySelector('[type="reset"]');
      if(!this.input||!this.results) return;
      this.input.setAttribute('role','combobox');
      this.input.setAttribute('aria-autocomplete','list');
      this.input.setAttribute('aria-haspopup','listbox');
      this.input.setAttribute('aria-controls',this.results.id);
      this.input.setAttribute('aria-expanded','false');
      this.input.autocomplete='off';
      this.input.addEventListener('input',()=> {
        clearTimeout(this.timer);
        this.request?.abort();
        this.reset.hidden=!this.input.value.length;
        this.close();
        const query=this.input.value.trim();
        if(query) this.timer=setTimeout(()=>this.search(query),180);
      },options);
      this.input.addEventListener('keydown',event=> {
        const items=Array.from(this.results.querySelectorAll('[data-option]'));
        if(event.key==='Escape') {event.preventDefault();this.close();return;}
        if(this.results.hidden||!items.length) return;
        if(event.key==='ArrowDown'||event.key==='ArrowUp') {
          event.preventDefault();
          const direction=event.key==='ArrowDown'?1:-1;
          this.active=this.active<0?(direction>0?0:items.length-1):(this.active+direction+items.length)%items.length;
          items.forEach((item,index)=>item.setAttribute('aria-selected',String(index===this.active)));
          this.input.setAttribute('aria-activedescendant',items[this.active].id);
          items[this.active].scrollIntoView({block:'nearest'});
        } else if(event.key==='Enter'&&this.active>=0) {
          event.preventDefault();items[this.active].click();
        }
      },options);
      this.input.form.addEventListener('reset',event=> {
        event.preventDefault();clearTimeout(this.timer);this.request?.abort();this.input.value='';this.reset.hidden=true;this.close();this.input.focus();
      },options);
      document.addEventListener('click',event=> {if(!this.contains(event.target)) this.close();},options);
      this.addEventListener('focusout',()=> {setTimeout(()=> {if(!this.contains(document.activeElement)) this.close();},0);},options);
      this.active=-1;
    }
    async search(query) {
      this.request?.abort();
      const request=new AbortController();this.request=request;
      this.status.textContent=this.dataset.loading;
      this.results.setAttribute('aria-busy','true');
      try {
        const url=new URL(this.dataset.url,location.origin);
        url.search=new URLSearchParams({q:query,'resources[type]':'product','resources[limit]':'6',section_id:'pc-predictive-search'});
        const response=await fetch(url,{signal:request.signal});
        if(!response.ok) throw new Error('Suggestions unavailable');
        const html=new DOMParser().parseFromString(await response.text(),'text/html');
        const suggestions=html.querySelector('[data-pc-suggestions]');
        if(!suggestions) throw new Error('Suggestions missing');
        if(this.input.value.trim()!==query||request.signal.aborted) return;
        this.results.replaceChildren(document.importNode(suggestions,true));
        this.results.hidden=false;this.results.removeAttribute('aria-busy');this.input.setAttribute('aria-expanded','true');this.active=-1;
        this.status.textContent=`${suggestions.dataset.count} ${this.dataset.resultsLabel}`;
      } catch(error) {
        if(error.name==='AbortError'||request.signal.aborted) return;
        this.close();this.status.textContent=this.dataset.failure;
      }
    }
    close() {
      clearTimeout(this.timer);this.request?.abort();
      this.status.textContent='';
      this.results.hidden=true;this.results.removeAttribute('aria-busy');this.input.setAttribute('aria-expanded','false');this.input.removeAttribute('aria-activedescendant');this.active=-1;
      this.results.querySelectorAll('[aria-selected="true"]').forEach(item=>item.setAttribute('aria-selected','false'));
    }
    disconnectedCallback() {clearTimeout(this.timer);this.request?.abort();this.listeners?.abort();}
  });
}
