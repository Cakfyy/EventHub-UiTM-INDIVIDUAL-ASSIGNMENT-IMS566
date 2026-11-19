// ===== js/profile.js =====
// Profile page.
const u = me();
$('#av').textContent = u.name.charAt(0).toUpperCase();
$('#pn').value = u.name; $('#pe').value = u.email; $('#pph').value = u.phone || '';
$('#pr').value = u.role === 'admin' ? 'Admin' : 'Customer';
$('#pf').addEventListener('submit', e => {
  e.preventDefault();
  e.target.classList.add('was-validated');
  if (!e.target.checkValidity()) return;
  const d = { name:$('#pn').value.trim(), email:$('#pe').value.trim(), phone:$('#pph').value.trim() };
  Users.save(Users.all().map(x => x.username === u.username ? { ...x, ...d } : x));
  $('#av').textContent = d.name.charAt(0).toUpperCase();
  toast('Profile updated');
});
$('#reset').addEventListener('click', () => {
  if (confirm('Restore events, participants and venues to the original sample data? Your changes will be lost.')) { DB.reset(); toast('Sample data restored'); }
});

// Clear data. Admin clears all events and participants (venues are kept). Customer clears only their own registrations.
if (!isAdmin()) {
  $('#dtitle').textContent = 'Demo data';
  $('#dnote').textContent = 'Reload the demo data to test again, or clear only your own registrations. Other people\'s data is not touched.';
  $('#clear').innerHTML = '<i class="bi bi-trash me-1"></i>Clear my registrations';
}
$('#clear').addEventListener('click', () => {
  if (isAdmin()) {
    if (confirm('Delete ALL events and participants? Venues are kept.')) { DB.set('events', []); DB.set('participants', []); toast('Events and participants cleared', 'danger'); }
  } else if (confirm('Delete all your registrations?')) {
    DB.set('participants', DB.get('participants').filter(p => p.username !== me().username)); toast('Your registrations were cleared', 'danger');
  }
});
