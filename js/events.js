// ===== js/events.js =====
// Events page: tiles or list view, search by, CRUD (admin), Register (customer).
const CATS = ['Technology', 'Career', 'Sports', 'Workshop', 'Seminar'];
const crd = isAdmin() && crud({ key:'events', label:'Event', nameField:'name', onChange:render,
  fields:[
    { name:'name', label:'Event name', type:'text' },
    { name:'category', label:'Category', type:'select', options:() => CATS },
    { name:'date', label:'Date', type:'date' },
    { name:'time', label:'Time', type:'time' },
    { name:'location', label:'Venue', type:'text', list:() => DB.get('venues').map(v => v.name) },
    { name:'organizer', label:'Organizer', type:'text' },
    { name:'capacity', label:'Capacity', type:'number', min:1 },
    { name:'status', label:'Status', type:'select', options:() => ['Upcoming', 'Completed', 'Cancelled'] },
    { name:'description', label:'Description', type:'textarea' }],
  // Keep participants linked when an event is renamed or deleted
  onSave: (old, d) => { if (old && old.name !== d.name) DB.set('participants', DB.get('participants').map(p => p.event === old.name ? { ...p, event:d.name } : p)); },
  onRemove: old => DB.set('participants', DB.get('participants').filter(p => p.event !== old.name)),
  validate: (d, old) => { const n = old ? eventsWithCount().find(e => e.id === old.id).registered : 0; return d.capacity < n ? `Capacity cannot be lower than the ${n} participants already registered.` : ''; } });

$('#vtWrap').innerHTML = viewToggleHTML();

// Does this event match the search?
function match(e, by, q) {
  if (by === 'date') return !q || e.date === q;
  const text = { name:e.name, category:e.category, venue:e.location, all:[e.name, e.category, e.location, e.organizer, e.date, fmtDate(e.date)].join(' ') }[by];
  return text.toLowerCase().includes(q.toLowerCase());
}
const acts = e => isAdmin()
  ? `<a class="btn btn-sm btn-outline-primary" href="event-details.html?id=${e.id}" title="View details"><i class="bi bi-eye"></i></a><button class="btn btn-sm btn-outline-secondary" onclick="crd.edit(${e.id})" title="Edit"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" onclick="crd.del(${e.id})" title="Delete"><i class="bi bi-trash"></i></button>`
  : `<a class="btn btn-sm btn-outline-primary" href="event-details.html?id=${e.id}">Details</a><button class="btn btn-sm btn-primary" onclick="registerEvent(${e.id})" ${e.status === 'Upcoming' ? '' : 'disabled'}>Register</button>`;
const tile = (e, i) => `<div class="col-6 col-xl-4"><div class="card tile pop" style="--i:${i}"><div class="card-body p-3 p-md-4 d-flex flex-column">
  <div class="d-flex justify-content-between align-items-start mb-3"><span class="ico"><i class="bi bi-${CAT_ICON[e.category] || 'calendar-event'}"></i></span>${badge(e.status)}</div>
  <div class="small text-body-secondary">${esc(e.category)}</div><h2 class="h5 mb-2">${esc(e.name)}</h2>
  <div class="small"><i class="bi bi-calendar-event me-2"></i>${fmtDate(e.date)}, ${esc(e.time)}</div>
  <div class="small mb-3"><i class="bi bi-geo-alt me-2"></i>${esc(e.location)}</div>
  <div class="d-flex justify-content-between small mb-2"><span>Participants</span><strong>${e.registered} of ${e.capacity}</strong></div>${mprog(pct(e))}
  <div class="d-flex flex-wrap gap-2 mt-4">${acts(e)}</div></div></div></div>`;
const row = (e, i) => `<div class="lrow pop" style="--i:${i}"><span class="ico"><i class="bi bi-${CAT_ICON[e.category] || 'calendar-event'}"></i></span>
  <div><strong>${esc(e.name)}</strong><div class="small text-body-secondary">${esc(e.category)}</div></div>
  <div class="small hide-m">${fmtDate(e.date)}<br>${esc(e.time)}</div><div class="small hide-m">${esc(e.location)}</div>
  <div class="hide-m"><div class="small mb-1">${e.registered} of ${e.capacity}</div>${mprog(pct(e))}</div>${badge(e.status)}<div class="d-flex gap-1 justify-content-end">${acts(e)}</div></div>`;

// Events are split into partitions by status. Each partition has a heading and can be collapsed.
const PARTS = [['Upcoming', 'calendar-event', 'Coming soon'], ['Completed', 'check2-circle', 'Already finished'], ['Cancelled', 'x-circle', 'Called off']];
function render() {
  const by = $('#by').value, q = $('#q').value, all = eventsWithCount().filter(e => match(e, by, q));
  let n = 0;
  $('#list').innerHTML = !all.length ? `<p class="text-body-secondary">No events found.${isAdmin() ? ' Use "Add event" to create one.' : ''}</p>` : PARTS.map(([st, ic, sub]) => {
    const g = all.filter(e => e.status === st).sort((a, b) => st === 'Upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
    if (!g.length) return '';
    return grp(st, ic, st, sub, g.length, view === 'list' ? `<div class="card overflow-hidden">${g.map(e => row(e, n++)).join('')}</div>` : `<div class="row g-3">${g.map(e => tile(e, n++)).join('')}</div>`);
  }).join('');
}
render();
