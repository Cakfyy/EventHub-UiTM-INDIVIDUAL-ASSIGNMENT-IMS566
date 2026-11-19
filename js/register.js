// ===== js/register.js =====
// Register page: 3 cards in a slideshow. Each step is checked before moving on. The active card tilts with the cursor.
const f = document.getElementById('rf'), msg = document.getElementById('err');
const cards = [...document.querySelectorAll('.rcard')], val = id => document.getElementById(id).value.trim();
let cur = 0, reached = 0;

// Place the cards: active in the middle, neighbours behind on each side
function layout() {
  cards.forEach((c, i) => { const o = i - cur; c.dataset.o = Math.abs(o) > 1 ? (o < 0 ? '-2' : '2') : o; c.inert = o !== 0; });
  document.getElementById('rstep').textContent = cur + 1;
  document.getElementById('rprev').style.visibility = cur === 0 ? 'hidden' : 'visible';
  document.getElementById('rnext').style.visibility = cur === cards.length - 1 ? 'hidden' : 'visible';
  document.getElementById('rdots').innerHTML = cards.map((_, i) => `<button type="button" class="${i === cur ? 'on' : ''}" aria-label="Step ${i + 1}" onclick="jump(${i})"></button>`).join('');
}
const stepOk = () => [...cards[cur].querySelectorAll('input')].every(i => i.reportValidity());   // shows the browser message on the first wrong field
function go(d) { if (d > 0 && !stepOk()) return; cur = Math.max(0, Math.min(cards.length - 1, cur + d)); reached = Math.max(reached, cur); layout(); }
function jump(i) { if (i <= reached) { cur = i; layout(); } }

// Tilt: the card leans and moves a little toward the cursor
cards.forEach(c => {
  const t = c.querySelector('.tilt');
  c.addEventListener('pointermove', e => {
    if (c.dataset.o !== '0') return;
    const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    t.style.setProperty('--ry', (x * 12) + 'deg'); t.style.setProperty('--rx', (-y * 10) + 'deg');
    t.style.setProperty('--tx', (x * 10) + 'px'); t.style.setProperty('--ty', (y * 8) + 'px');
  });
  c.addEventListener('pointerleave', () => ['--ry', '--rx', '--tx', '--ty'].forEach(p => t.style.removeProperty(p)));
});
document.addEventListener('keydown', e => { if (e.target.tagName !== 'INPUT') { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); } });

f.addEventListener('submit', e => {
  e.preventDefault();
  if (cur < cards.length - 1) return go(1);   // Enter on step 1 or 2 = Next
  const pw = document.getElementById('pass').value, p2 = document.getElementById('pass2');
  p2.setCustomValidity(pw === p2.value ? '' : 'Passwords do not match');
  if (!stepOk()) return;
  if (Users.find(val('user'))) { msg.textContent = 'That username is already taken. Choose another one.'; msg.classList.remove('d-none'); cur = 0; layout(); return; }
  Users.save([...Users.all(), { username:val('user'), password:pw, role:'customer', name:val('name'), email:val('email'), phone:val('phone') }]);
  sessionStorage.setItem('eh_user', val('user'));
  location.href = 'dashboard.html';
});
layout();
