// ===== js/theme.js =====
// Dark / light mode (dark is the default) and the click ripple on buttons.
document.documentElement.setAttribute('data-bs-theme', localStorage.getItem('eh_theme') || 'dark');
function toggleTheme() {
  const h = document.documentElement;
  const next = h.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
  h.setAttribute('data-bs-theme', next);
  localStorage.setItem('eh_theme', next);
  document.dispatchEvent(new Event('themechange')); // tell charts to redraw
}
// Ripple: a small circle grows from the click point
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('.btn');
  if (!b || b.disabled) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
  s.className = 'ripple';
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.append(s);
  setTimeout(() => s.remove(), 600);
});
