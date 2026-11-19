// ===== js/event-details.js =====
// Event details page: one heading (the event name), details card, and participants table (admin, sortable).
const e = eventsWithCount().find(x => x.id === Number(new URLSearchParams(location.search).get('id')));
const box = $('#d');
if (!e) {
  box.innerHTML = '<div class="alert alert-warning">This event does not exist or was deleted.</div><a href="events.html" class="btn btn-outline-secondary">Back to Events</a>';
} else {
  document.title = e.name + ' | EventHub UiTM';
  const pc = pct(e), ps = DB.get('participants').filter(p => p.event === e.name);
  const facts = [['Date', fmtDate(e.date)], ['Time', e.time], ['Venue', e.location], ['Organizer', e.organizer], ['Capacity', e.capacity], ['Registered', `${e.registered} (${pc}%)`]];
  $('#actions').innerHTML = `<a href="events.html" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i>Back to Events</a><button class="btn btn-primary cust-only" onclick="registerEvent(${e.id})" ${e.status === 'Upcoming' ? '' : 'disabled'}>Register for this event</button>`;
  box.innerHTML = `${secHead(CAT_ICON[e.category] || 'calendar-event', esc(e.name), esc(e.category))}
  <div class="card"><div class="card-body p-4">
    <div class="mb-3">${badge(e.status)}</div><p class="mb-4" style="max-width:70ch">${esc(e.description)}</p>
    <div class="row g-3 mb-4">${facts.map(([k, v]) => `<div class="col-6 col-md-4"><div class="small text-body-secondary">${k}</div><div class="fw-bold">${esc(v)}</div></div>`).join('')}</div>
    ${mprog(pc)}</div></div>
  <div class="admin-only">${secHead('people', 'Registered participants', 'Everyone signed up for this event', ps.length)}<div id="ptable"></div></div>`;
  // Participants table. Click a header to sort.
  window.render = () => {
    const rows = sortRows('ep', ps, (p, k) => p[k]);
    $('#ptable').innerHTML = ps.length ? `<div class="card"><div class="table-responsive"><table class="table mb-0"><thead><tr>${[['id', 'ID', 'ps-4'], ['name', 'Name'], ['regDate', 'Registered on'], ['status', 'Status']].map(([k, l, c]) => sortTh('ep', k, l, c)).join('')}</tr></thead><tbody>${rows.map(p => `<tr><td class="ps-4">${pid('P', p.id)}</td><td>${esc(p.name)}</td><td>${fmtDate(p.regDate)}</td><td>${badge(p.status)}</td></tr>`).join('')}</tbody></table></div></div>`
      : '<p class="text-body-secondary">No participant records for this event yet.</p>';
  };
  render();
}
