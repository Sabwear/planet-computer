// Carry the chosen product into the enquiry without submitting any information.
(() => {
  const product = new URLSearchParams(window.location.search).get('product');
  if (!product) return;
  document.querySelectorAll('[data-product-context]').forEach((field) => {
    if (field.value.trim()) return;
    field.value = `${field.dataset.productPrefix} ${product.slice(0, 500)}\n\n`;
  });
})();
