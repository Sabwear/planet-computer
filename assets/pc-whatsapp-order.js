/* Build only on deliberate click, using current native variant and quantity. */
document.addEventListener('click', event => {
  const link = event.target.closest('[data-whatsapp-product]');
  if (!link) return;
  const scope = link.closest('product-info') || link.closest('[data-quick-view-content]');
  const form = link.closest('form') || scope?.querySelector('product-form form');
  const variantId = form?.querySelector('[name="id"]')?.value;
  const quantityInput = scope?.querySelector('[name="quantity"]') || form?.querySelector('[name="quantity"]');
  if (quantityInput && !quantityInput.checkValidity()) { event.preventDefault(); quantityInput.reportValidity(); return; }
  let variants;
  try { variants = JSON.parse(link.dataset.variants); } catch { event.preventDefault(); return; }
  const variant = variants.find(item => String(item.id) === String(variantId)) || (!variantId && variants.find(item => item.available));
  if (!variant?.available) { event.preventDefault(); return; }
  const quantity = Number(quantityInput?.value || variant.quantity_rule?.min || 1);
  const rule = variant.quantity_rule;
  if (!Number.isInteger(quantity) || quantity < (rule?.min || 1) || (rule?.max && quantity > rule.max) || quantity % (rule?.increment || 1)) { event.preventDefault(); return; }
  const option = variant.title && variant.title !== 'Default Title' ? ` — ${variant.title}` : '';
  const url = new URL(link.dataset.url, location.origin); url.searchParams.set('variant', variant.id);
  const message = `Bonjour Planet Computer, je souhaite commander : ${link.dataset.title}${option}. Quantité : ${quantity}. ${url.href}\nMerci de confirmer la disponibilité, les frais éventuels et les modalités avant validation.`;
  link.href = `https://wa.me/${link.dataset.phone}?text=${encodeURIComponent(message)}`;
});
