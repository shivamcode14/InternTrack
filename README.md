# InternTrack Web (Week 1 prototype)

InternTrack is a React + Vite prototype for tracking internship applications. It uses sample data and simulated authentication; there is no backend yet.

## Requirements

- Node.js 18 or newer
- npm (included with Node.js)

## Run locally

Open a terminal in the project folder (the folder containing `package.json`), then run:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173. To stop the server, press `Ctrl+C`.

> If npm reports that it cannot find `package.json`, change directory to the inner `interntrack-web` project folder first.

## Features

- Simulated login and registration with protected application pages
- Dashboard totals, status counts, recent applications, and upcoming dates
- Add, edit, and delete application records with validation
- Search by company or job title and filter by status or source
- Duplicate job-link warning and responsive application table

Application records are held in memory and reset when the page is refreshed. The simulated login lasts for the current browser session.

## Week 1 completion checklist

- [ ] Add, edit, and delete applications; validation messages appear for invalid input
- [ ] Search and status/source filters work together; clearing filters restores the list
- [ ] Dashboard counts, recently added records, and upcoming dates update after changes
- [ ] Login and registration validate input, and protected routes redirect to login
- [ ] The layout remains usable at phone width
- [ ] `npm run build` completes successfully
- [ ] Screenshots captured for the dashboard, application list, validation errors, and mobile layout
- [ ] Project pushed to your GitHub repository

## GitHub

Create an empty repository on GitHub, then run these commands from the project folder. Replace `<your-username>` with your GitHub username:

```powershell
git init
git add .
git commit -m "Week 1: React prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/interntrack-web.git
git push -u origin main
```

## Project guide

See [STEPS.md](./STEPS.md) for the day-by-day build guide and troubleshooting notes.
