# InternTrack — Step-by-Step Guide

This project contains the **finished Week 1 React prototype and Week 2 Spring Boot + MySQL backend**.
You can use this guide two ways:

- **Mode A — Run it:** do Part 1, Part 2, and Part 4, then explore.
- **Mode B — Learn by rebuilding (recommended for your report/viva):** do Part 1, then create a fresh
  Vite project and follow Part 3 and Part 5 day by day, writing each file yourself (use this project as the answer key).

---------------------------------------------------------------------
## PART 1 — Install the tools (≈ 45 min, one time)

1. **JDK 17 or newer.** Download Temurin 17 from https://adoptium.net or use the JDK bundled with IntelliJ. Check it in a new terminal with `java -version`.
2. **IntelliJ IDEA Community** from https://www.jetbrains.com/idea. IntelliJ includes Maven; you do not need to install Maven separately.
3. **MySQL Community Server 8.x + MySQL Workbench** from https://dev.mysql.com/downloads. During installation, set a root password and remember it. Keep the default port `3306`.
4. **Postman** from https://www.postman.com/downloads. A free account is fine.
5. **Node.js LTS** from https://nodejs.org (18 or newer) and **Git** from https://git-scm.com if they are not already installed. Check with `node -v`, `npm -v`, and `git --version`.
6. **VS Code** from https://code.visualstudio.com for the React frontend. Optional extensions: ES7 React snippets, Prettier.
7. Unzip `interntrack-web.zip` somewhere easy, e.g. `Documents/projects/`, then open the project folder in VS Code and the `backend` folder as a project in IntelliJ IDEA.

## PART 2 — Run the React app (≈ 10 min)

1. In the terminal: `npm install`   (downloads libraries; takes 1–2 min)
2. `npm run dev`
3. Open the link shown (usually http://localhost:5173).
4. Start the backend as described in Part 4, then register with a name, email, and password.
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
   `addApplication` or `updateApplication` and navigates to `/applications`. In the finished app these context methods call the authenticated API.
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
- **Cannot connect / login fails:** confirm MySQL and the Spring Boot API are running, and check the API terminal for the first error.

## PART 4 — Run the full-stack application (Mode A)

The completed backend lives in `backend/`. Start MySQL, then use IntelliJ IDEA and a terminal:

**Start the API in IntelliJ IDEA**
1. Open the `backend` folder (the one containing `pom.xml`) as a project and wait for Maven sync to finish.
2. Open the Maven tool window. Expand `interntrack-api` → `Plugins` → `spring-boot`, then double-click `spring-boot:run`.
3. Copy `backend/src/main/resources/application-local.properties.example` to `application-local.properties` in that resources folder, then set your MySQL root password and a private random JWT secret with at least 32 characters. The new local file is git-ignored; do not commit it.
4. The API starts on http://localhost:8080. Keep the run configuration active.

**Terminal — React app**, from the folder containing `package.json`:
```powershell
npm install
npm run dev
```

Open the Vite URL, register a new account, and create an application. The API creates the `interntrack` database when the MySQL account has permission; otherwise create it first with `CREATE DATABASE interntrack;`. For a shared deployment, configure `JWT_SECRET` with a private random string of at least 32 characters and set `CORS_ALLOWED_ORIGINS` to the frontend origin.

## PART 5 — Week 2 backend learning path (Mode B)

For the Week 2 tool installation, backend run instructions, Postman walkthrough, and project-rebuild setup, see [STEPS-WEEK2.md](./STEPS-WEEK2.md). Use the completed `backend/` as the answer key. Work through these topics in order, writing the implementation yourself in a fresh branch or copy:

1. **Spring Boot and MySQL:** inspect `backend/pom.xml` and `application.properties`; run the API and observe JPA create the tables.
2. **Users and registration:** build the user entity/repository and registration endpoint; store only BCrypt password hashes and make email unique.
3. **Login and API security:** authenticate credentials, sign a short-lived bearer token, and protect routes with Spring Security.
4. **Application persistence:** model the application fields, connect each record to its owner, and implement CRUD endpoints.
5. **Authorization and validation:** scope every read/write by the authenticated owner; verify that another account cannot read, edit, or delete the record.
6. **React integration:** connect auth and application state to API calls; inspect browser network requests and error handling.
7. **Test and document:** build the frontend, run backend tests, and exercise registration, login, CRUD, invalid input, and cross-user access in Postman.

### API request examples

Register with `POST /api/auth/register`:
```json
{"name":"Alex","email":"alex@example.com","password":"example-password"}
```

Send the returned token in the `Authorization: Bearer YOUR_TOKEN` header. Create an application with `POST /api/applications`:
```json
{
  "companyName":"Example Co",
  "jobTitle":"Software Engineer Intern",
  "jobUrl":"https://example.com/jobs/1",
  "source":"Company Website",
  "status":"APPLIED",
  "applicationDate":"2026-10-11",
  "followUpDate":null,
  "interviewDate":null,
  "notes":"Applied on the company careers page."
}
```

## Done-when checklist for Week 1
- [x] Add, edit, delete work; validation messages show
- [x] Search + status/source filters work together; Clear restores the list
- [x] Dashboard counts, recent list and upcoming list update after changes
- [x] Login/Register validation and route guard checked
- [x] Responsive layout checked at phone width
- [x] Code pushed to GitHub
- [x] Frontend production build succeeds
- [x] Backend tests pass (22 tests, zero failures)

**Report evidence:** Screenshots have not been collected yet.
