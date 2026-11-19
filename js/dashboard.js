// ===== js/dashboard.js =====
// Dashboard: Apple-style summary slides, radial chart grid, stacked area chart, upcoming list.
const ev = isAdmin() ? eventsWithCount() : myEvents();   // customer: joined events only
$('#hello').textContent = `Welcome back, ${profile().name.split(' ')[0]}!`;
$('#sub').textContent = isAdmin() ? 'Your events at a glance' : 'The events you joined at a glance';

// ---- Numbers ----
const up = ev.filter(e => e.status === 'Upcoming').sort((a, b) => a.date.localeCompare(b.date));
const done = ev.filter(e => e.status === 'Completed');
const seats = ev.reduce((s, e) => s + e.registered, 0), cap = ev.reduce((s, e) => s + e.capacity, 0);
const venueN = new Set(ev.map(e => e.location)).size, next = up[0];
const pctOf = (a, b) => b ? Math.min(100, Math.round(a / b * 100)) : 0;
const nextNote = next ? `Next up is ${next.name} on ${fmtDate(next.date)}.` : 'Nothing is scheduled yet.';
const nextLink = next ? [`See ${next.name}`, `event-details.html?id=${next.id}`] : null;

// ---- Apple-style slides: one at a time, big gradient number, pill pagination ----
const slides = isAdmin() ? [
  { c:'a1', eyebrow:'Events', n:ev.length, sub:`events in total, with ${up.length} upcoming and ${done.length} completed.` },
  { c:'a2', eyebrow:'Upcoming', n:up.length, sub:nextNote, link:nextLink },
  { c:'a3', eyebrow:'Participants', n:seats, sub:`registered across all events, filling ${pctOf(seats, cap)}% of the seats.` },
  { c:'a4', eyebrow:'Completed', n:done.length, sub:`events wrapped up, using ${venueN} venue${venueN === 1 ? '' : 's'}.` }
] : [
  { c:'a1', eyebrow:'Joined', n:ev.length, sub:`events joined, with ${up.length} upcoming and ${done.length} completed.` },
  { c:'a2', eyebrow:'Upcoming', n:up.length, sub:nextNote, link:nextLink },
  { c:'a3', eyebrow:'Venues', n:venueN, sub:'places where your events happen.' },
  { c:'a4', eyebrow:'Completed', n:done.length, sub:'events you have attended.' }
];
$('#slides').innerHTML = slides.map(s => `<article class="slide ${s.c}"><div class="eyebrow">${s.eyebrow}</div><div class="big" data-n="${s.n}">0</div><p class="sub">${esc(s.sub)}</p>${s.link ? `<a class="alink" href="${s.link[1]}">${esc(s.link[0])} <i class="bi bi-chevron-right"></i></a>` : ''}</article>`).join('');
$('#pdots').innerHTML = slides.map((_, i) => `<button class="d" aria-label="Show slide ${i + 1}" onclick="show(${i})"><i class="f"></i></button>`).join('');

let idx = 0, playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {   // number counts up from 0
  const n = +el.dataset.n, t0 = performance.now();
  const tick = t => { const k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function show(i) {
  idx = (i + slides.length) % slides.length;
  [...$('#slides').children].forEach((s, k) => s.classList.toggle('on', k === idx));
  [...$('#pdots').children].forEach((d, k) => {
    d.classList.toggle('on', k === idx);
    const f = d.firstChild; f.style.animation = 'none'; void f.offsetWidth; f.style.animation = '';   // restart the fill
  });
  countUp($('#slides').children[idx].querySelector('.big'));
}
function togglePlay() {
  playing = !playing;
  $('#pager').classList.toggle('paused', !playing);
  $('#pp').innerHTML = `<i class="bi bi-${playing ? 'pause' : 'play'}-fill"></i>`;
  $('#pp').setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
}
$('#pdots').addEventListener('animationend', e => { if (playing && e.target.classList.contains('f')) show(idx + 1); });   // fill finished: next slide
let x0 = null;   // swipe left / right
$('#stage').addEventListener('pointerdown', e => { x0 = e.clientX; });
$('#stage').addEventListener('pointerup', e => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) show(idx + (e.clientX < x0 ? 1 : -1)); x0 = null; });
$('#stage').addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1); });
if (!playing) $('#pager').classList.add('paused');
show(0);

// ---- Radial chart with grid (one ring per score), with labels ----
const rings = [['Seat fill', pctOf(seats, cap), '#7c5cff'], ['Upcoming', pctOf(up.length, ev.length), '#22d3ee'], ['Completed', pctOf(done.length, ev.length), '#34d399'], ['Venue use', pctOf(venueN, DB.get('venues').length), '#fbbf24']];
const avg = Math.round(rings.reduce((t, r) => t + r[1], 0) / rings.length);
let svg = '<svg viewBox="0 0 260 260" class="rg" id="rg" role="img" aria-label="Radial chart of event scores">';
rings.forEach((_, i) => { svg += `<circle class="rg-grid" cx="130" cy="130" r="${114.5 - i * 21}"/>`; });   // grid circles
svg += '<circle class="rg-grid" cx="130" cy="130" r="30.5"/>';
for (let a = 0; a < 12; a++) { const t = a * Math.PI / 6; svg += `<line class="rg-spoke" x1="${130 + 30.5 * Math.cos(t)}" y1="${130 + 30.5 * Math.sin(t)}" x2="${130 + 114.5 * Math.cos(t)}" y2="${130 + 114.5 * Math.sin(t)}"/>`; }   // grid spokes
rings.forEach(([l, s, c], i) => { svg += `<circle class="rg-track" cx="130" cy="130" r="${104 - i * 21}" style="stroke:${c}"/>`; });
rings.forEach(([l, s, c], i) => { svg += `<circle class="rg-bar ${s ? '' : 'z'}" data-i="${i}" data-s="${s}" cx="130" cy="130" r="${104 - i * 21}" pathLength="100" style="stroke:${c}"><title>${l}: ${s}%</title></circle>`; });
svg += `<text x="130" y="131" class="rg-num">${avg}</text><text x="130" y="148" class="rg-sub">Average</text></svg>`;
$('#rgrid').innerHTML = svg;
$('#rleg').innerHTML = rings.map(([l, s, c], i) => `<div class="rl" onmouseenter="hl(${i})" onmouseleave="hl(-1)"><i style="background:${c}"></i>${l}<b>${s}%</b></div>`).join('');
function hl(i) { $('#rg').classList.toggle('dim', i >= 0); document.querySelectorAll('.rg-bar').forEach(b => b.classList.toggle('on', +b.dataset.i === i)); }   // hover a label to highlight its ring
requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('.rg-bar').forEach(b => b.style.strokeDasharray = `${b.dataset.s} 100`)));   // rings fill up

// ---- Upcoming list ----
$('#up').innerHTML = up.slice(0, 5).map(e => `<a class="up-row" href="event-details.html?id=${e.id}"><span class="ico"><i class="bi bi-${CAT_ICON[e.category] || 'calendar-event'}"></i></span><div class="flex-grow-1"><strong>${esc(e.name)}</strong><div class="small text-body-secondary">${fmtDate(e.date)}, ${esc(e.time)} at ${esc(e.location)}</div></div><div style="width:130px" class="d-none d-md-block">${mprog(pct(e))}</div><span class="small text-nowrap">${e.registered} of ${e.capacity}</span></a>`).join('')
  || `<p class="text-body-secondary mb-0">${isAdmin() ? 'No upcoming events. Add one from the Events page.' : 'You have no upcoming events. Register for one on the Events page.'}</p>`;

// ---- Stacked area chart with dashed strokes (sign-ups per month, split by category) ----
function monthList() {
  if (!ev.length) return [];
  const ms = ev.map(e => e.date.slice(0, 7)).sort();
  let [y, m] = ms[0].split('-').map(Number); const [y2, m2] = ms[ms.length - 1].split('-').map(Number), out = [];
  const add = () => { out.push(`${y}-${String(m).padStart(2, '0')}`); if (++m > 12) { m = 1; y++; } };
  while (y < y2 || (y === y2 && m <= m2)) add();
  while (out.length < 3) add();   // at least 3 months so the area is visible
  return out;
}
let chart;
function draw() {
  if (chart) chart.destroy();
  const cs = getComputedStyle(document.documentElement), v = k => cs.getPropertyValue(k).trim();
  Chart.defaults.font.family = 'DM Sans';
  const months = monthList(), cats = [...new Set(ev.map(e => e.category))], colors = ['#7c5cff', '#22d3ee', '#34d399', '#fbbf24', '#f472b6'];
  chart = new Chart($('#c1'), { type:'line', data:{ labels: months.map(m => new Date(m + '-01T00:00').toLocaleDateString('en-MY', { month:'short', year:'numeric' })),
    datasets: cats.map((c, i) => ({ label:c, fill:true, tension:.4, pointRadius:0, pointHoverRadius:5, borderWidth:2.5, borderDash:[8, 5], borderColor:colors[i % 5], backgroundColor:colors[i % 5] + '55',
      data: months.map(m => ev.filter(e => e.category === c && e.date.startsWith(m)).reduce((s, e) => s + e.registered, 0)) })) },
    options:{ maintainAspectRatio:false, interaction:{ mode:'index', intersect:false }, plugins:{ legend:{ labels:{ usePointStyle:true, boxWidth:8, color:v('--bs-secondary-color') } } },
      scales:{ y:{ stacked:true, beginAtZero:true, ticks:{ precision:0, color:v('--bs-secondary-color') }, grid:{ color:v('--bs-border-color') } }, x:{ ticks:{ color:v('--bs-secondary-color') }, grid:{ display:false } } } } });
}
draw();
document.addEventListener('themechange', draw);
