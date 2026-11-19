// ===== js/login.js =====
// Login page.
if (sessionStorage.getItem('eh_user')) location.replace('dashboard.html');
document.getElementById('lf').addEventListener('submit', e => {
  e.preventDefault();
  const u = Users.find(document.getElementById('user').value.trim());
  if (u && u.password === document.getElementById('pass').value) {
    sessionStorage.setItem('eh_user', u.username);
    location.href = 'dashboard.html';
  } else {
    document.getElementById('err').classList.remove('d-none');
  }
});

// Fill in a demo account (used by the Admin / Customer buttons)
function fill(u, p) { document.getElementById('user').value = u; document.getElementById('pass').value = p; }
