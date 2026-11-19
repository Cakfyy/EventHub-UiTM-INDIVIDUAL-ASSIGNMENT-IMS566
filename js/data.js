// ===== js/data.js =====
// Sample data (SEED), localStorage helpers (DB) and user accounts (Users).
// Starting data. Changes from CRUD are saved in localStorage.
// ---- Sample data for testing. Participants are generated so each event's count matches its seats. ----
const NAMES = ['Nur Aisyah', 'Daniel Tan', 'Priya Nair', 'Muhammad Haziq', 'Siti Balqis', 'Farid Zulkifli', 'Lim Wei Jie', 'Aina Sofea', 'Kavita Raj', 'Hafiz Ramli', 'Nurul Izzah', 'Wong Kah Mun', 'Syafiq Anuar', 'Divya Menon', 'Amirul Faiz', 'Farah Nabila', 'Chong Jia Hao', 'Zulaikha Omar', 'Ravi Shankar', 'Irfan Danish', 'Sarah Lee', 'Khairul Anwar', 'Nabilah Hamid', 'Jason Lim', 'Aisyah Rahman', 'Hakimi Yusof', 'Mei Ling', 'Arif Hassan', 'Thiru Kumar', 'Balqis Noor', 'Danial Iskandar', 'Suhana Zain', 'Ethan Goh', 'Liyana Aziz', 'Faiz Mahmud', 'Anis Sabrina', 'Raj Kumar', 'Sofia Ibrahim', 'Adam Mikhail'];
// [name, category, date, time, venue, organizer, capacity, registered, status, description]
const EV_SEED = [
  ['Tech Innovation Day', 'Technology', '2026-12-05', '09:00', 'Dewan Seri Utama', 'Faculty of Computer and Mathematical Sciences', 16, 14, 'Upcoming', 'A full day of talks and demos on AI, cloud and student start-ups.'],
  ['Career Fair 2026', 'Career', '2026-12-12', '10:00', 'Grand Hall', 'Student Affairs Division (HEP)', 20, 12, 'Upcoming', 'Meet employers hiring graduates and interns across industries.'],
  ['Sports Carnival', 'Sports', '2027-01-18', '08:00', 'Stadium Utama', 'Sports Council', 20, 11, 'Upcoming', 'Inter-faculty competition with track events, futsal and tug of war.'],
  ['UI/UX Basics Workshop', 'Workshop', '2026-12-20', '14:00', 'Lab Komputer 3', 'Design Club', 10, 10, 'Upcoming', 'Hands-on session on wireframing and usability testing with Figma.'],
  ['Cybersecurity Talk', 'Seminar', '2027-02-06', '10:00', 'Auditorium A', 'Faculty of Computer and Mathematical Sciences', 20, 6, 'Upcoming', 'Practical advice on staying safe online, from phishing to passwords.'],
  ['Photography Workshop', 'Workshop', '2026-11-28', '15:00', 'Seminar Room 2', 'Photo Club', 8, 3, 'Upcoming', 'Learn composition and lighting, then shoot around the campus.'],
  ['Digital Entrepreneurship Seminar', 'Seminar', '2026-10-10', '09:30', 'Auditorium A', 'Business Faculty', 15, 12, 'Completed', 'Founders share how they launched and funded online businesses.'],
  ['48-Hour Hackathon', 'Technology', '2026-09-05', '09:00', 'Dewan Seri Utama', 'IT Society', 12, 12, 'Completed', 'Teams build a working prototype around a community problem.'],
  ['Alumni Networking Night', 'Career', '2026-08-22', '19:00', 'Grand Hall', 'UiTM Alumni Office', 14, 9, 'Completed', 'Dinner and mentoring tables connecting alumni with final-year students.'],
  ['Charity Run 5K', 'Sports', '2026-07-12', '07:00', 'Stadium Utama', 'Sports Council', 20, 16, 'Completed', 'Fun run with all entry fees donated to local food banks.'],
  ['Industry Visit', 'Career', '2026-11-05', '08:30', 'Grand Hall', 'Student Affairs Division (HEP)', 25, 0, 'Cancelled', 'Company visit that was called off because of the weather.']
];
const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
function buildParticipants() {
  const out = []; let n = 0;
  EV_SEED.forEach(e => {
    for (let k = 0; k < e[7]; k++) out.push({ id:0, name:NAMES[n++ % NAMES.length], event:e[0], regDate:addDays(e[2], -(4 + (k * 5) % 31)), status: e[8] === 'Upcoming' && k % 6 === 3 ? 'Pending' : 'Confirmed' });
  });
  // The demo customer (Aiman Hakim, username "customer") joined three events
  [['Sports Carnival', 'Pending'], ['Tech Innovation Day', 'Confirmed'], ['Digital Entrepreneurship Seminar', 'Confirmed']].forEach(([ev, st]) => {
    const p = out.find(x => x.event === ev); Object.assign(p, { name:'Aiman Hakim', username:'customer', status:st });
  });
  // A few cancelled registrations (not counted in the seats)
  [['Career Fair 2026', 'Hakimi Yusof'], ['Sports Carnival', 'Mei Ling'], ['UI/UX Basics Workshop', 'Arif Hassan'], ['Cybersecurity Talk', 'Danial Iskandar'], ['Charity Run 5K', 'Liyana Aziz']].forEach(([ev, nm]) => {
    const e = EV_SEED.find(x => x[0] === ev); out.push({ id:0, name:nm, event:ev, regDate:addDays(e[2], -9), status:'Cancelled' });
  });
  return out.map((p, i) => ({ ...p, id:i + 1 }));
}

const SEED = {
  events: EV_SEED.map((e, i) => ({ id:i + 1, name:e[0], category:e[1], date:e[2], time:e[3], location:e[4], organizer:e[5], capacity:e[6], status:e[8], description:e[9] })),
  participants: buildParticipants(),
  venues: [
    { id:1, name:'Dewan Seri Utama', location:'Block A, Main Campus', capacity:500, availability:'Available' },
    { id:2, name:'Grand Hall', location:'Level 2, Student Centre', capacity:600, availability:'Booked' },
    { id:3, name:'Auditorium A', location:'Faculty of Business', capacity:250, availability:'Available' },
    { id:4, name:'Lab Komputer 3', location:'Block C, Level 3', capacity:45, availability:'Maintenance' },
    { id:5, name:'Stadium Utama', location:'Sports Complex', capacity:2000, availability:'Available' },
    { id:6, name:'Seminar Room 2', location:'Library, Level 4', capacity:60, availability:'Available' }
  ]
};

// Read / add / update / delete records in localStorage
const DB = {
  get(k) {
    try { const r = localStorage.getItem('eh_' + k); if (r) return JSON.parse(r); } catch (e) {}
    this.set(k, SEED[k]);
    return JSON.parse(JSON.stringify(SEED[k]));
  },
  set(k, d) { localStorage.setItem('eh_' + k, JSON.stringify(d)); },
  add(k, o) { const d = this.get(k); o.id = d.reduce((m, x) => Math.max(m, x.id), 0) + 1; d.push(o); this.set(k, d); },
  update(k, id, o) { this.set(k, this.get(k).map(x => x.id === id ? { ...x, ...o } : x)); },
  remove(k, id) { this.set(k, this.get(k).filter(x => x.id !== id)); },
  reset() { ['events', 'participants', 'venues'].forEach(k => localStorage.removeItem('eh_' + k)); }
};

// One-time reload of the sample data when its version changes (replaces events, participants and venues in this browser)
if (localStorage.getItem('eh_seedv') !== '3') { DB.reset(); localStorage.setItem('eh_seedv', '3'); }

// Accounts: admin and customer are hardcoded. New customers register on register.html.
const SEED_USERS = [
  { username:'admin', password:'admin123', role:'admin', name:'Admin', email:'admin@uitm.edu.my', phone:'012-3456789' },
  { username:'customer', password:'customer123', role:'customer', name:'Aiman Hakim', email:'aiman@student.uitm.edu.my', phone:'013-9876543' }
];
const Users = {
  all() { try { const r = JSON.parse(localStorage.getItem('eh_users')); if (r) return r; } catch (e) {} this.save(SEED_USERS); return SEED_USERS; },
  save(u) { localStorage.setItem('eh_users', JSON.stringify(u)); },
  find(n) { return this.all().find(u => u.username.toLowerCase() === String(n).toLowerCase()); }
};
