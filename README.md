# InternTrack

InternTrack is a React + Vite application backed by a Spring Boot REST API and MySQL. Users register and log in, then manage private internship application records.

## Requirements

- Node.js 18 or newer and npm
- JDK 17 or newer
- IntelliJ IDEA Community (includes Maven; no separate Maven install is required)
- MySQL 8 or newer

## Run locally

1. Install MySQL 8 and MySQL Workbench, set a root password, keep port `3306`, and start the MySQL server.
2. Open the `backend` folder (the folder containing `pom.xml`) as a project in IntelliJ IDEA Community and wait for Maven sync.
3. Copy `backend/src/main/resources/application-local.properties.example` to `application-local.properties` in that same resources folder, then set the MySQL root password and a private random JWT secret of at least 32 characters in the copy. That local file is ignored by Git; do not commit it. Open IntelliJ's Maven tool window and run `interntrack-api` → `Plugins` → `spring-boot` → `spring-boot:run`. The API listens on http://localhost:8080.
4. From the project folder containing `package.json`, run:

   ```powershell
   npm install
   npm run dev
   ```

5. Open the local Vite URL, usually http://localhost:5173. Register an account to start with an empty application list.

Vite proxies `/api` requests to port 8080 during development. For a separately hosted API, set `VITE_API_URL` to its base URL and configure `CORS_ALLOWED_ORIGINS` on the API.
The checked-in JWT key fallback is for local development only. For any shared deployment, configure `JWT_SECRET` with a private random string of at least 32 characters.
The shared request helper is in `src/api/client.js`; the existing login page already calls the backend through the auth context. To smoke-test it, start the API, run the React app, and log in with a registered account. A successful login takes you to the dashboard. Do not print or share bearer tokens in the browser console.

## Features

- Real account registration and login; passwords are stored as BCrypt hashes
- Signed 24-hour bearer tokens for API access
- User-scoped application list, create, update, and delete operations
- Dashboard totals, status counts, recent applications, and upcoming dates
- Application validation, search, status/source filters, and duplicate-link warning

## API routes

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create an account and receive a bearer token |
| POST | `/api/auth/login` | No | Authenticate and receive a bearer token |
| GET | `/api/me` or `/api/auth/me` | Yes | Return the authenticated user |
| GET | `/api/applications?q=&status=&source=&page=0&size=50` | Yes | Search and filter the current user's applications; returns a page |
| GET | `/api/applications/{id}` | Yes | Get an application owned by the current user |
| POST | `/api/applications` | Yes | Create an application for the current user |
| PUT | `/api/applications/{id}` | Yes | Update an application owned by the current user |
| DELETE | `/api/applications/{id}` | Yes | Delete an application owned by the current user |
| GET | `/api/dashboard/stats` | Yes | Return `{ total, countsByStatus, recent }` for the current user |
| GET | `/api/reminders/upcoming?limit=8` | Yes | Return upcoming follow-ups and interviews, soonest first |

Send protected requests with `Authorization: Bearer <token>`. A record belonging to another user is returned as not found, including for update and delete. Invalid request bodies and query parameters return JSON errors; validation field details are in `fieldErrors`.

The importable Postman collection is [InternTrack-API.postman_collection.json](./backend/postman/InternTrack-API.postman_collection.json). It contains 22 ordered requests, including dashboard, reminder, filtering, ownership, and empty-date checks. Run the collection with the API and MySQL available.

## Project guide

See [STEPS.md](./STEPS.md) for the frontend learning steps and [STEPS-WEEK2.md](./STEPS-WEEK2.md) for installing the Week 2 tools and running the backend.
