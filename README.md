# EventHub UiTM

Event management system (front-end prototype) for IMS566. Manage events, participants and venues, with a dashboard, dark/light mode and full CRUD.

**Test login:** admin / `admin123` (full access) or customer / `customer123` (browse and register for events). New customers can register on `register.html`.

## Features
- Login with hardcoded credentials and error feedback
- Dashboard: summary cards, Chart.js registration and category charts, upcoming events
- Events, Participants and Venues pages with search/filter and Add / Edit / Delete (Bootstrap modals + toasts)
- Event details page
- Profile editing and "Restore sample data"
- Dark / light mode (saved in the browser), favicon, responsive layout

## Technologies
HTML5, Bootstrap 5.3, Bootstrap Icons, custom CSS, JavaScript, Chart.js, localStorage (no backend; data stays in your browser).

## Deploy
Push the folder to GitHub, then Settings > Pages > deploy from the main branch (root).

## File guide

| File | What it is for |
|---|---|
| `index.html` | Login page |
| `register.html` | Customer registration |
| `dashboard.html` | Summary cards, charts, upcoming events |
| `events.html` | Event list (admin: CRUD, customer: Register) |
| `event-details.html` | One event in full |
| `participants.html` | Participants (admin) / My registrations (customer) |
| `venues.html` | Venue list |
| `profile.html` | Account details (name, email, phone) |
| `css/style.css` | All custom styles, split into 13 numbered sections |
| `js/theme.js` | Dark / light mode |
| `js/data.js` | Sample data, localStorage (DB), accounts (Users) |
| `js/app.js` | Left sidebar, footer, popups, role check, register / cancel event |
| `js/crud.js` | Add / Edit / Delete modal |
| `js/login.js`, `js/register.js` | Login and register logic |
| `js/dashboard.js`, `events.js`, `participants.js`, `venues.js`, `event-details.js`, `profile.js` | Logic for the page with the same name |
| `assets/icons/` | Favicon and logo |

**Want to change something?** Colours: `css/style.css` section 1. Sidebar menu or footer: `js/app.js`. Sample data: `js/data.js`. Form fields: `fields` list in `events.js`, `participants.js` or `venues.js`.

## UI notes
- Look: crypto-wallet style dashboard (dark glass cards, violet-to-cyan gradients, glow background). Dark is the default, light mode is one click away.
- Sidebar can be collapsed to icons with the round handle on its edge (remembered).
- Dashboard starts with Apple-style summary slides (swipe, arrows, dots, auto-play).
- Events and Venues have a Tiles / List switch (remembered). Events and Participants have "search by" (all fields, name, category, date, venue / ID, name, event, date, status).
- Event progress bars are animated (fill, flow, shine) and turn amber/red when almost full.
- Buttons lift on hover, press on click and show a ripple (`js/theme.js`).
- Sample data for testing: 11 events, about 110 participants and 6 venues. The demo customer (customer / customer123) joined 3 events. Admin can restore or clear the data on the Profile page.
- Events and Venues are split into partitions (by status / availability) with collapsible headings.
- Register is a 3-card slideshow with arrows. The active card tilts with the cursor.
