// ===== js/participants.js =====
// Participants page (admin) / My registrations (customer). Search by ID, name, event, date, status.
const crd = isAdmin() && crud({ key:'participants', label:'Participant', nameField:'name', onChange:render,
  fields:[
    { name:'name', label:'Full name', type:'text' },
    { name:'event', label:'Event', type:'select', options:() => DB.get('events').map(e => e.name) },
    { name:'regDate', label:'Registration date', type:'date' },
    { name:'username', label:'Customer username (optional)', type:'text', req:false, list:() => Users.all().filter(u => u.role === 'customer').map(u => u.username) },
    { name:'status', label:'Status', type:'select', options:() => ['Confirmed', 'Pending', 'Cancelled'] }],
  // Block adding to a full event
  validate: (d, old) => {
    const e = eventsWithCount().find(x => x.name === d.event);
    const self = old && old.event === d.event && old.status !== 'Cancelled' ? 1 : 0;
    return e && d.status !== 'Cancelled' && e.registered - self >= e.capacity ? 'This event is full.' : '';
  } });

// Does this participant match the search?
function match(p, by, q) {
  if (by === 'date') return !q || p.regDate === q;
  if (by === 'id' && /^\d+$/.test(q)) return p.id === Number(q);
  const code = pid('P', p.id);
  const text = { id:code, name:p.name, event:p.event, status:p.status, all:[code, p.name, p.event, p.status, p.regDate, fmtDate(p.regDate)].join(' ') }[by];
  return text.toLowerCase().includes(q.toLowerCase());
}

// Draw table rows
function render() {
  const by = $('#by').value, q = $('#q').value, adm = isAdmin();
  let rows = DB.get('participants').filter(p => (adm || p.username === me().username) && match(p, by, q));
  // Sortable headers
  $('#thead').innerHTML = [['id', 'ID', 'ps-4'], ['name', 'Name'], ['event', 'Event'], ['regDate', 'Registered on'], ['status', 'Status']].map(([k, l, c]) => sortTh('p', k, l, c)).join('') + '<th></th>';
  rows.splice(0, rows.length, ...sortRows('p', rows, (p, k) => p[k]));
  $('#pcount').textContent = rows.length;
  const cnt = s => rows.filter(p => p.status === s).length;
  $('#pnote').textContent = `${cnt('Confirmed')} confirmed, ${cnt('Pending')} pending, ${cnt('Cancelled')} cancelled`;
  $('#rows').innerHTML = rows.map((p, i) => `<tr class="pop" style="--i:${Math.min(i, 12)}"><td class="ps-4">${pid('P', p.id)}</td><td class="fw-bold">${esc(p.name)}</td><td>${esc(p.event)}</td><td>${fmtDate(p.regDate)}</td><td>${badge(p.status)}</td>
    <td class="text-end text-nowrap pe-3">${adm ? `<button class="btn btn-sm btn-outline-secondary" onclick="crd.edit(${p.id})" title="Edit"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-outline-danger" onclick="crd.del(${p.id})" title="Delete"><i class="bi bi-trash"></i></button>` : `<button class="btn btn-sm btn-outline-danger" onclick="cancelReg(${p.id})" ${p.status === 'Cancelled' ? 'disabled' : ''}>Cancel registration</button>`}</td></tr>`).join('')
    || '<tr><td colspan="6" class="text-center text-body-secondary py-4">No participants found.</td></tr>';
}
if (!isAdmin()) $('#ttl').textContent = 'My registrations';
render();
