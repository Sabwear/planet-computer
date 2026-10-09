(() => {
  const content = document.querySelector('[data-article-content]');
  if (!content) return;
  const toc = document.querySelector('[data-article-toc]');
  const headings = [...content.querySelectorAll('h2')];
  if (toc && headings.length > 1) {
    headings.forEach((heading, index) => {
      if (!heading.id) { let id = `pc-article-section-${index + 1}`; while (document.getElementById(id)) id += '-x'; heading.id = id; }
      const item = document.createElement('li'); const link = document.createElement('a');
      link.href = `#${heading.id}`; link.textContent = heading.textContent; item.append(link); toc.querySelector('ol').append(item);
    });
    toc.hidden = false;
  }
  const reading = document.querySelector('[data-reading-time]');
  if (reading) { const count = content.textContent.trim().split(/\s+/).filter(Boolean).length; reading.textContent = `${Math.max(1, Math.ceil(count / 200))} min de lecture`; reading.hidden = false; }
})();
