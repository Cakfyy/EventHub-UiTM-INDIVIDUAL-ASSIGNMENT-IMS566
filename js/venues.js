// ===== js/venues.js =====
// Venues page: tiles or list view. Admin = CRUD, customer = venues of events they joined.
const crd = isAdmin() && crud({ key:'venues', label:'Venue', nameField:'name', onChange:render,
  fields:[
    { name:'name', label:'Venue name', type:'text' },
    { name:'location', label:'Location', type:'text' },
    { name:'capacity', label:'Capacity', type:'number', min:1 },
    { name:'availability', label:'Availability', type:'select', options:() => ['Available', 'Booked', 'Maintenance'] }] });

$('#vtWrap').innerHTML = viewToggleHTML();

// Customer sees only venues of the events they joined
const visibleVenues = () => isAdmin() ? DB.get('venues') : DB.get('venues').filter(v => myEvents().some(e => e.location === v.name));
const acts = v => `<button class="btn btn-sm btn-outline-secondary admin-only" onclick="crd.edit(${v.id})" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger admin-only" onclick="crd.del(${v.id})" title="Delete"><i class="bi bi-trash"></i></button>`;
const forEvents = v => isAdmin() ? '' : myEvents().filter(e => e.location === v.name).map(e => esc(e.name)).join(', ');

const tile = (v, i) => `<div class="col-6 col-xl-4"><div class="card tile pop" style="--i:${i}"><div class="card-body p-3 p-md-4 d-flex flex-column">
  <div class="d-flex justify-content-between align-items-start mb-3"><span class="ico"><i class="bi bi-buildings"></i></span>${badge(v.availability)}</div>
  <h2 class="h5 mb-2">${esc(v.name)}</h2>
  <div class="small"><i class="bi bi-geo-alt me-2"></i>${esc(v.location)}</div>
  <div class="small ${isAdmin() ? 'mb-3' : ''}"><i class="bi bi-people me-2"></i>Capacity ${v.capacity}</div>
  ${isAdmin() ? '' : `<div class="small mb-3"><i class="bi bi-calendar-event me-2"></i>${forEvents(v)}</div>`}
  <div class="d-flex gap-2 mt-auto">${acts(v)}</div></div></div></div>`;
const row = (v, i) => `<div class="lrow v pop" style="--i:${i}"><span class="ico"><i class="bi bi-buildings"></i></span>
  <div><strong>${esc(v.name)}</strong><div class="small text-body-secondary">${esc(v.location)}</div></div>
  <div class="small hide-m">Capacity ${v.capacity}${isAdmin() ? '' : `<br>${forEvents(v)}`}</div>${badge(v.availability)}<div class="d-flex gap-1 justify-content-end">${acts(v)}</div></div>`;

// Venues are split into partitions by availability.
const PARTS = [['Available', 'check-circle', 'Ready to book'], ['Booked', 'bookmark-check', 'Already reserved'], ['Maintenance', 'tools', 'Temporarily closed']];
function render() {
  const all = visibleVenues();
  let n = 0;
  $('#list').innerHTML = !all.length ? `<p class="text-body-secondary">${isAdmin() ? 'No venues yet. Add your first venue.' : 'Venues of the events you join will show here.'}</p>` : PARTS.map(([st, ic, sub]) => {
    const g = all.filter(v => v.availability === st);
    if (!g.length) return '';
    return grp(st, ic, st, sub, g.length, view === 'list' ? `<div class="card overflow-hidden">${g.map(v => row(v, n++)).join('')}</div>` : `<div class="row g-3">${g.map(v => tile(v, n++)).join('')}</div>`);
  }).join('');
}
render();
