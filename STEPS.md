# InternTrack — Week 1: Step-by-Step Guide

This project is the **finished Week 1 prototype** (React UI + sample data, no backend).
You can use this guide two ways:

- **Mode A — Run it:** do Part 1 and Part 2, then explore.
- **Mode B — Learn by rebuilding (recommended for your report/viva):** do Part 1, then create a fresh
  Vite project and follow Part 3 day by day, writing each file yourself (use this project as the answer key).

---------------------------------------------------------------------
## PART 1 — One-time setup (≈ 30 min)

1. **Install Node.js (LTS)** from https://nodejs.org. Then check:
   `node -v` (18 or higher) and `npm -v`.
2. **Install VS Code** from https://code.visualstudio.com. Optional extensions: ES7 React snippets, Prettier.
3. **Install Git** from https://git-scm.com and create a free GitHub account.
4. **Unzip** `interntrack-web.zip` somewhere easy, e.g. `Documents/projects/`.
5. Open the folder in VS Code (File → Open Folder), then open the terminal (Terminal → New Terminal).

## PART 2 — Run the finished prototype (≈ 10 min)

1. In the terminal: `npm install`   (downloads libraries; takes 1–2 min)
2. `npm run dev`
3. Open the link shown (usually http://localhost:5173).
4. Log in with any email (e.g. `you@example.com`) and any password — Week 1 login is **simulated**.
5. Try everything: dashboard cards, search/filters, Add, Edit, Delete.
6. Stop the server with `Ctrl + C`.

**Put it on GitHub (do this today):**
```
git init
git add .
git commit -m "Week 1: React prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/interntrack-web.git
git push -u origin main
```
(Create the empty repo on github.com first. `node_modules` is already ignored by `.gitignore`.)

---------------------------------------------------------------------
## PART 3 — Day-by-day build steps (Mode B)

Start a new project: `npm create vite@latest interntrack-web -- --template react`, then
`cd interntrack-web`, `npm install`, `npm install react-router-dom`, `npm run dev`.
Keep the dev server running while you work; the browser refreshes on every save.

### DAY 1 — Skeleton, routing, layout  (≈ 2–3 h)
Files: `src/main.jsx`, `src/App.jsx`, `src/components/Layout.jsx`, `src/pages/*`, `src/styles/index.css`
1. Delete the Vite demo content (`App.css`, the counter, logos).
2. Create folders: `pages`, `components`, `context`, `data`, `constants`, `utils`, `styles`.
3. In `main.jsx` wrap `<App />` with `<BrowserRouter>`.
4. Create empty pages: Login, Register, Dashboard, Applications, ApplicationForm, NotFound (each just an `<h1>`).
5. In `App.jsx` define `<Routes>`: `/login`, `/register` (no navbar) and the rest inside a `<Route element={<Layout />}>`.
6. Build `Layout.jsx`: navbar with `<NavLink>`s + `<Outlet />` for the page.
**Check:** clicking the navbar changes the page without a full reload; unknown URLs show "Page not found".

### DAY 2 — Sample data + application list  (≈ 2–3 h)
Files: `constants/statuses.js`, `data/sampleApplications.js`, `context/ApplicationsContext.jsx`, `components/StatusBadge.jsx`, `pages/Applications.jsx`, `utils/dates.js`
1. `statuses.js`: export the six statuses (SAVED … REJECTED) with a label and color, plus the SOURCES list.
2. `sampleApplications.js`: 10 fake records using the report's field names.
3. `ApplicationsContext.jsx`: `useState(sampleApplications)` plus `addApplication`, `updateApplication`,
   `deleteApplication`, `getApplication`; wrap `<App />` in `ApplicationsProvider` in `main.jsx`.
4. `StatusBadge.jsx`: colored pill from the status value.
5. `Applications.jsx`: read the list with `useApplications()` and render a table (company, role, status, source, next date).
6. `utils/dates.js`: `parseLocal`, `formatDate` helpers for showing dates like "14 Oct 2026".
**Check:** 10 rows with colored status pills and readable dates.

### DAY 3 — Add / Edit form + validation  (≈ 3–4 h)
Files: `components/Field.jsx`, `utils/validation.js`, `pages/ApplicationForm.jsx`
1. `Field.jsx`: a reusable label + input/select/textarea + error message.
2. `validation.js`: `validateApplication(values)` returns an object of errors:
   company required, job title required, URL must start with http/https, application date required unless status is Saved, notes ≤ 1000 chars.
3. `ApplicationForm.jsx`: one `values` state object; `handleChange` updates it; `handleSubmit` validates, then calls
   `addApplication` or `updateApplication` and navigates to `/applications`.
4. Edit mode: read `:id` with `useParams()`, load the record with `getApplication(id)` and pre-fill the form.
5. Delete: add a confirm dialog (`window.confirm`) before `deleteApplication`.
6. Bonus (from the report, P1): warn if the same job link already exists.
**Check:** empty submit shows errors; add/edit/delete all update the list instantly.

### DAY 4 — Search and filters  (≈ 2 h)
File: `pages/Applications.jsx`
1. Add state: `search`, `status`, `source`.
2. Compute `filtered` with `useMemo` (match company/title text AND status AND source).
3. Add the search box, two dropdowns and a "Clear filters" button; show "No applications match…" when empty.
**Check:** combinations work (e.g. search "zoho" + status Interview); clearing restores all rows.

### DAY 5 — Dashboard  (≈ 2–3 h)
File: `pages/Dashboard.jsx`
1. Count applications per status (loop once, build an object) and show a card per status + a total.
2. Make each card a link to `/applications?status=APPLIED`; read it in Applications with `useSearchParams()`.
3. "Recently added": sort by id descending, take 5.
4. "Upcoming": collect follow-up and interview dates that are today or later, sort ascending, take 8, show "Today / Tomorrow / In N days".
**Check:** add an application → counts and lists change on the dashboard immediately.

### DAY 6 — Login/Register screens + polish  (≈ 2–3 h)
Files: `context/AuthContext.jsx`, `pages/Login.jsx`, `pages/Register.jsx`, `components/Layout.jsx`, CSS
1. `AuthContext`: holds `user`, `login`, `logout` (fake — real auth in Week 2).
2. Login/Register forms with validation (email format, password ≥ 8 chars, passwords match).
3. In `Layout`, redirect to `/login` if there is no user; add a Log out button.
4. Responsive CSS: forms stack on narrow screens, table scrolls sideways instead of breaking the page.
**Check:** visiting `/dashboard` while logged out sends you to login; the layout works at phone width
(Chrome DevTools → toggle device toolbar).

### DAY 7 — Review, README, screenshots  (≈ 2 h)
1. Click through every flow once, as a new user. Write down bugs; fix the top ones.
2. Run `npm run build` — it must finish without errors.
3. Take screenshots: dashboard, list, form with errors, mobile view (for your report).
4. Update the README checklist, commit, and push to GitHub.
5. Start Week 2 prep: install JDK 17+, IntelliJ IDEA (Community), MySQL Server + Workbench, and Postman.

---------------------------------------------------------------------
## Troubleshooting
- **`npm` not recognized:** reinstall Node.js, then close and reopen the terminal/VS Code.
- **Blank page:** open the browser console (F12). A red error names the file and line to fix.
- **"Port already in use":** another dev server is running; stop it with Ctrl + C or use the new port Vite prints.
- **Changes not showing:** save the file (Ctrl + S) and check the terminal is still running `npm run dev`.
- **Data disappears on refresh:** expected in Week 1; data is stored in memory until the backend arrives.

## Done-when checklist for Week 1
- [ ] Add, edit, delete work; validation messages show
- [ ] Search + status/source filters work together; Clear restores the list
- [ ] Dashboard counts, recent list and upcoming list update after changes
- [ ] Login/Register screens validate input and the route guard works
- [ ] Looks fine on a phone-width screen
- [ ] Code pushed to GitHub
