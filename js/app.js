// ===== js/app.js =====
// Shared code: helpers, popup messages, navbar, footer, role check, register / cancel event.
// ---- Helpers ----
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const fmtDate = d => new Date(d + 'T00:00').toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' });
const pid = (p, id) => p + String(id).padStart(3, '0');
const STATUS = { Upcoming:'info', Completed:'secondary', Cancelled:'danger', Confirmed:'success', Pending:'warning', Available:'success', Booked:'warning', Maintenance:'danger' };
const badge = s => `<span class="tag t-${String(s).toLowerCase()}">${esc(s)}</span>`;
function me() { const n = sessionStorage.getItem('eh_user'); return n && Users.find(n); }
const isAdmin = () => !!me() && me().role === 'admin';
const profile = () => me() || {};

// ---- UI helpers: category icons, motion progress bar, Tiles / List switch, search-by ----
const CAT_ICON = { Technology:'cpu', Career:'briefcase', Sports:'trophy', Workshop:'tools', Seminar:'mic' };
const mprog = p => `<div class="mprog ${p >= 90 ? 'hot' : ''}" style="--w:${p}%" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><span></span></div>`;
const pct = e => Math.min(100, Math.round(e.registered / e.capacity * 100));
const VKEY = 'eh_view_' + (document.body.dataset.page || '');
let view = localStorage.getItem(VKEY) || 'tiles';   // remembered per page
function setView(v) { view = v; localStorage.setItem(VKEY, v); $('#vt').dataset.v = v; render(); }
const viewToggleHTML = () => `<div class="vt" id="vt" data-v="${view}" role="group" aria-label="View"><span class="thumb"></span><button onclick="setView('tiles')" title="Tile view"><i class="bi bi-grid-3x3-gap-fill me-1"></i>Tiles</button><button onclick="setView('list')" title="List view"><i class="bi bi-list-ul me-1"></i>List</button></div>`;
// "Search by" bar: the page needs #by (select), #q (input) and a render() function. Date mode uses a date picker.
function byChange() {
  const q = $('#q'), by = $('#by');
  q.type = by.value === 'date' ? 'date' : 'text'; q.value = '';
  q.placeholder = by.value === 'all' ? by.dataset.all : 'Search by ' + by.selectedOptions[0].text.toLowerCase();
  render();
}

// ---- Partition headings: icon, title, subtitle, count, gradient line. grp() makes a collapsible group. ----
const secHead = (icon, title, sub, count) => `<div class="sec-head"><span class="sh-no"></span><span class="sh-ico"><i class="bi bi-${icon}"></i></span><div class="sh-text"><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${count !== undefined ? `<span class="sh-count">${count}</span>` : ''}<span class="sh-line"></span></div>`;
const closedGrp = new Set();   // groups the user collapsed (kept while searching)
const grp = (key, icon, title, sub, count, inner) => `<section class="grp ${closedGrp.has(key) ? 'closed' : ''}"><div class="sec-head clickable" role="button" tabindex="0" aria-expanded="${!closedGrp.has(key)}" onclick="toggleGrp(this, '${key}')" onkeydown="if (event.key === 'Enter') toggleGrp(this, '${key}')"><span class="sh-no"></span><span class="sh-ico"><i class="bi bi-${icon}"></i></span><div class="sh-text"><h2>${title}</h2><p>${sub}</p></div><span class="sh-count">${count}</span><span class="sh-line"></span><i class="bi bi-chevron-down sh-chev"></i></div><div class="grp-body"><div class="grp-in"><div class="grp-pad">${inner}</div></div></div></section>`;
function toggleGrp(el, key) { const c = el.closest('.grp').classList.toggle('closed'); c ? closedGrp.add(key) : closedGrp.delete(key); el.setAttribute('aria-expanded', !c); }

// ---- Sortable table headers: click a header to sort, click again to reverse ----
const SORT = {};   // one entry per table: { k: column, d: 1 or -1 }
function sortTh(tbl, k, label, cls = '') {
  const s = SORT[tbl] || {}, on = s.k === k;
  return `<th class="sortable ${on ? 'on' : ''} ${cls}" tabindex="0" role="button" aria-sort="${on ? (s.d > 0 ? 'ascending' : 'descending') : 'none'}" onclick="sortBy('${tbl}', '${k}')" onkeydown="if (event.key === 'Enter') sortBy('${tbl}', '${k}')">${label}<i class="bi bi-${on ? (s.d > 0 ? 'sort-up' : 'sort-down') : 'arrow-down-up'}"></i></th>`;
}
function sortBy(tbl, k) { SORT[tbl] = SORT[tbl] && SORT[tbl].k === k ? { k, d:-SORT[tbl].d } : { k, d:1 }; render(); }
function sortRows(tbl, rows, get) {
  const s = SORT[tbl]; if (!s) return rows;
  return [...rows].sort((a, b) => { const x = get(a, s.k), y = get(b, s.k); return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric:true, sensitivity:'base' })) * s.d; });
}

// ---- Events with a live participant count (counts participants that are not Cancelled) ----
function eventsWithCount() {
  const ps = DB.get('participants');
  return DB.get('events').map(e => ({ ...e, registered: ps.filter(p => p.event === e.name && p.status !== 'Cancelled').length }));
}

// ---- Customer: events joined (not cancelled) ----
function myEvents() {
  const names = DB.get('participants').filter(p => p.username === me().username && p.status !== 'Cancelled').map(p => p.event);
  return eventsWithCount().filter(e => names.includes(e.name));
}

// ---- Customer: register for / cancel an event ----
function registerEvent(id) {
  const e = eventsWithCount().find(x => x.id === id), u = me();
  if (!e || e.status !== 'Upcoming') return toast('Registration is closed for this event.', 'danger');
  if (e.registered >= e.capacity) return toast('This event is full.', 'danger');
  if (DB.get('participants').some(p => p.username === u.username && p.event === e.name && p.status !== 'Cancelled')) return toast('You are already registered for this event.', 'warning');
  DB.add('participants', { name:u.name, username:u.username, event:e.name, regDate:new Date().toISOString().slice(0, 10), status:'Pending' });
  toast('You are registered for ' + e.name);
  if (typeof render === 'function') render();
}
function cancelReg(id) {
  const p = DB.get('participants').find(x => x.id === id);
  if (!p || p.status === 'Cancelled' || !confirm('Cancel your registration for ' + p.event + '?')) return;
  DB.update('participants', id, { status:'Cancelled' });
  toast('Registration cancelled', 'danger'); render();
}

// ---- Popup message (bottom right) ----
function toast(msg, type = 'success') {
  let c = $('#toasts');
  if (!c) { c = document.createElement('div'); c.id = 'toasts'; c.className = 'toast-container position-fixed bottom-0 end-0 p-3'; document.body.append(c); }
  const t = document.createElement('div');
  t.className = `toast align-items-center text-bg-${type} border-0`;
  t.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(msg)}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  c.append(t);
  new bootstrap.Toast(t, { delay:2600 }).show();
  t.addEventListener('hidden.bs.toast', () => t.remove());
}

// Collapse / expand the sidebar (remembered)
function toggleSide() { localStorage.setItem('eh_side', document.body.classList.toggle('side-collapsed') ? '1' : ''); }
function logout() { sessionStorage.removeItem('eh_user'); location.href = 'index.html'; }

// ---- Sidebar and footer (built on every page after login) ----
(function () {
  const pg = document.body.dataset.page;
  if (!pg) return;
  if (!sessionStorage.getItem('eh_user')) { location.replace('index.html'); return; }
  document.body.dataset.role = me().role;
  const links = [['dashboard','Dashboard'], ['events','Events'], ['participants', isAdmin() ? 'Participants' : 'My registrations'], ['venues','Venues'], ['profile','Profile']];
  const ico = { dashboard:'speedometer2', events:'calendar-event', participants:isAdmin() ? 'people' : 'ticket-perforated', venues:'geo-alt', profile:'person' };
  if (localStorage.getItem('eh_side')) document.body.classList.add('side-collapsed');
  const logo = n => `<img src="assets/icons/favicon.svg" width="${n}" height="${n}" alt="">`;
  const themeBtn = cls => `<button class="${cls}" onclick="toggleTheme()" aria-label="Toggle dark mode" title="Dark / light mode"><i class="bi bi-moon-stars t-light"></i><i class="bi bi-sun t-dark"></i></button>`;
  const cur = links.find(l => l[0] === pg);
  const role = isAdmin() ? 'Admin' : 'Customer', initial = esc(me().name.charAt(0).toUpperCase());
  // Phone: top bar with menu button. Desktop: sidebar on the left with a handle to collapse it.
  $('#nav').innerHTML = `
    <div class="eh-top d-lg-none">
      <a class="brand d-flex align-items-center gap-2 text-decoration-none" href="dashboard.html">${logo(28)}<span>${cur ? cur[1] : 'EventHub UiTM'}</span></a>
      <div class="d-flex gap-2">${themeBtn('btn btn-outline-secondary btn-icon')}<button class="btn btn-outline-secondary btn-icon" data-bs-toggle="offcanvas" data-bs-target="#side" aria-label="Open menu"><i class="bi bi-list"></i></button></div>
    </div>
    <div class="offcanvas-lg offcanvas-start eh-side" id="side" tabindex="-1">
      <div class="offcanvas-header d-lg-none"><span class="brand">Menu</span><button class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#side" aria-label="Close"></button></div>
      <div class="offcanvas-body d-flex flex-column">
        <a class="eh-brand d-none d-lg-flex align-items-center gap-2 mb-4 ms-1 text-decoration-none" href="dashboard.html">${logo(36)}<span class="brand fs-5 lbl">EventHub UiTM</span></a>
        <nav class="nav flex-column gap-1">${links.map(([k, l]) => `<a class="nav-link ${k === pg ? 'active' : ''}" href="${k}.html" title="${l}"><i class="bi bi-${ico[k]}"></i><span class="lbl">${l}</span></a>`).join('')}</nav>
        <div class="mt-auto pt-3">
          <div class="side-user d-flex align-items-center gap-2 mb-3 px-1"><span class="avatar-sm">${initial}</span><div class="lbl lh-sm" style="min-width:0"><strong class="d-block text-truncate">${esc(me().name)}</strong><span class="small text-body-secondary">${role}</span></div></div>
          <button class="btn btn-sm btn-outline-secondary w-100" onclick="logout()" title="Logout"><i class="bi bi-box-arrow-right"></i><span class="lbl ms-2">Logout</span></button>
        </div>
      </div>
    </div>
    <button class="side-hook d-none d-lg-grid" onclick="toggleSide()" aria-label="Collapse or expand menu" title="Collapse / expand menu"><i class="bi bi-chevron-left"></i></button>`;
  // Desktop top bar: page name and date on the left, theme button and user on the right
  $('#nav').insertAdjacentHTML('afterend', `<header class="topbar d-none d-lg-flex"><div><div class="brand fs-5">${cur ? cur[1] : ''}</div><div class="small text-body-secondary">${new Date().toLocaleDateString('en-MY', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div></div>
    <div class="d-flex align-items-center gap-3">${themeBtn('btn btn-outline-secondary btn-icon')}<div class="user-chip"><span class="avatar-sm">${initial}</span><div class="lh-sm"><strong class="d-block small">${esc(me().name)}</strong><span class="small text-body-secondary">${role}</span></div></div></div></header>`);
  $('#foot').innerHTML = `<footer class="eh-foot"><div class="container py-4"><div class="row g-4">
    <div class="col-md-5"><div class="brand fs-5 mb-1">EventHub UiTM</div><p class="small mb-0">Event management for organizers and staff. Keep events, participants and venues in one place.</p></div>
    <div class="col-6 col-md-3"><div class="fw-bold small mb-2">Quick links</div><div class="small d-grid gap-1">${links.map(([k, l]) => `<a href="${k}.html">${l}</a>`).join('')}</div></div>
    <div class="col-6 col-md-4"><div class="fw-bold small mb-2">Contact</div><div class="small">eventhub@uitm.edu.my<br>+60 3-0000 0000<br>UiTM Shah Alam, Selangor</div></div>
  </div><hr><div class="small">&copy; 2026 EventHub UiTM. IMS566 individual project.</div></div></footer>`;
})();
