# InternTrack — Week 2: Spring Boot + MySQL

This guide takes the Week 1 React app and connects it to the Spring Boot backend in `backend/`. Work through Part 1 once, then follow Part 2 to run and verify the API. Use Part 3 if you want to rebuild the backend as a learning exercise.

## PART 1 — Install the tools (≈ 45 min, one time)

1. **JDK 17 or newer.** Download Temurin 17 from https://adoptium.net (Windows `.msi`), or use IntelliJ's JDK download. If using the installer, enable `JAVA_HOME`. Open a new terminal and check:
   ```powershell
   java -version
   ```
   The version should be 17 or newer.
2. **IntelliJ IDEA Community** from https://www.jetbrains.com/idea. It includes Maven integration, so you do not need to install Maven separately. Confirm that IntelliJ opens.
3. **MySQL Community Server 8.x + MySQL Workbench** from https://dev.mysql.com/downloads. The MySQL Installer for Windows can install both; choose Developer Default or select Server and Workbench. Set a root password you will remember, and keep the default port `3306`.
   - Open Workbench, connect to your local instance, and enter the root password.
   - If the connection fails, open Windows Services, find `MySQL80`, and start it.
4. **Postman** from https://www.postman.com/downloads. Install and open the app. Sign in or choose a lightweight/skip option if it is offered.
5. **Git** from https://git-scm.com (already installed in Week 1). Check it with:
   ```powershell
   git --version
   ```
6. **Node.js LTS** from https://nodejs.org, version 18 or newer, for the React app. Check it with:
   ```powershell
   node -v
   npm -v
   ```
7. Unzip the project somewhere easy to find. Open the project folder (the one containing `package.json`) in VS Code. Open the `backend` folder (the one containing `pom.xml`) as a project in IntelliJ IDEA.

### Ready-to-continue check

- `java -version` reports 17 or newer.
- MySQL Workbench connects to the local MySQL Server.
- IntelliJ IDEA and Postman open.
- `git --version`, `node -v`, and `npm -v` print version numbers.

If a check fails, resolve it before continuing. Keep your MySQL root password private; do not add it to project files or commit it.

## PART 2 — Run the finished backend (≈ 20 min)

The backend is in the `backend/` folder of this project. If you received it as a separate `interntrack-api.zip`, unzip that archive first and use its project root instead of `backend/` in the paths below.

1. **Create the database:** open MySQL Workbench and connect to your local server. Choose **File → Open SQL Script**, select `backend/sql/create_database.sql` (or `sql/create_database.sql` from the standalone backend), then click the lightning bolt to run it. Refresh the Schemas panel; you should see `interntrack`.
2. **Add private settings:** copy `backend/src/main/resources/application-local.properties.example` to `backend/src/main/resources/application-local.properties` (for a standalone backend, use `src/main/resources/`). Open the new file and set:

   ```properties
   spring.datasource.password=YOUR_MYSQL_ROOT_PASSWORD
   app.jwt.secret=YOUR_RANDOM_SECRET_WITH_AT_LEAST_32_CHARACTERS
   ```

   `application-local.properties` is git-ignored. Keep it private and never commit it. Use a fresh random secret with at least 32 characters; the backend treats it as plain text for its local HMAC key.
3. **Open in IntelliJ:** choose **File → Open**, select the backend project's `pom.xml`, choose **Open as Project**, and trust the project. For this repository the file is `backend/pom.xml`. Wait for the initial Maven dependency download to finish.
4. **Run:** open `backend/src/main/java/com/interntrack/api/InternTrackApplication.java` (standalone backend: `src/main/java/com/interntrack/api/InternTrackApplication.java`) and click the green run icon next to `main`.
5. **Confirm startup:** the Run window should show `Started InternTrackApplication in ... seconds` and Tomcat on port `8080`. Refresh the Workbench schema; JPA creates the `users` and `applications` tables automatically.
6. **Test with Postman:** choose **Import → Files**, select `backend/postman/InternTrack-API.postman_collection.json` (standalone backend: `postman/InternTrack-API.postman_collection.json`). Open the collection's Runner using **Run** and run `InternTrack API`. Its 22 requests run in order and execute 50 assertions, including missing-token JSON rejection, duplicate registration (409), dashboard/reminder/search checks, empty-date handling, and user B's forbidden read/update/delete attempts against user A's application (TC-04). All should be green. Keep the API running during the test.
7. Stop the API with the red stop square in IntelliJ.

The Postman collection verifies that protected routes reject requests without a token, registers a unique temporary user, checks a duplicate registration and wrong-password login, logs in, checks the current user, verifies invalid input, creates an application and checks dashboard statistics, upcoming reminders, search/filter pagination, and empty date strings. It also checks that another user cannot read/update/delete the record, then confirms normal get/list/update/delete behavior. The JWT subject is checked against the registered user ID. Generated emails, tokens, dates, and application IDs use collection variables.

**Quick test without Postman** (PowerShell):

```powershell
curl.exe -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Asha","email":"asha@example.com","password":"password123"}'
```

A successful response is JSON containing a `token`. If you already registered that email, use a different one.

**Push the API as a separate GitHub repository:** this working copy is a combined React + API repository. To publish the backend separately, copy the contents of `backend/` into a new `interntrack-api` folder outside this repository, then run these commands from that new folder:

```powershell
git init
git add .
git commit -m "Week 2: Spring Boot backend"
git branch -M main
git remote add origin https://github.com/<you>/interntrack-api.git
git push -u origin main
```

Do not copy `src/main/resources/application-local.properties` into the new repository.

## Troubleshooting

- **MySQL connection refused:** check Windows Services and start `MySQL80`; confirm Workbench can connect.
- **Access denied for root:** verify the local `spring.datasource.username` and `spring.datasource.password` values.
- **Database does not exist:** reconnect in Workbench and run `CREATE DATABASE interntrack;`.
- **Port 8080 already in use:** stop the other API process or set `SERVER_PORT` to another port and update the Vite proxy.
- **401 Unauthorized:** register or log in again and use the returned bearer token. Check that `app.jwt.secret` stays the same while the API is running.
- **CORS error outside Vite:** set `CORS_ALLOWED_ORIGINS` to the exact frontend origin. For local Vite development, use `http://localhost:5173`.

## Week 2 done-when checklist

- [ ] MySQL Workbench connects, and the `interntrack` schema exists.
- [ ] Spring Boot starts successfully from IntelliJ.
- [ ] Postman confirms protected requests reject missing tokens, duplicate registration returns 409, wrong-password login returns 401, and a successful login returns a token.
- [ ] `users.password_hash` contains a BCrypt hash (starts with `$2a$`, `$2b$`, or `$2y$`), never a plain-text password.
- [ ] Postman confirms missing company is rejected and get-by-ID succeeds for an owned application.
- [ ] Protected requests fail without a token.
- [ ] The React app can register/log in and create, edit, list, and delete applications through the API.

## DAY 3 — CRUD API (learning / implementation reference)

The finished implementation is under `backend/src/main/java/com/interntrack/api/application/`. It groups DTOs, entity, repository, service, and controller in the `application` domain package rather than splitting them into generic `dto`, `model`, `service`, and `controller` packages:

- `ApplicationRequest` is the validated JSON input shape. It has no `userId`; the authenticated principal supplies the owner. Required company/title fields, allowed lengths, status, and notes are validated.
- `ApplicationResponse` is the JSON output shape and does not expose the owner or password hash.
- `ApplicationService` implements create, list, get, update, and delete. Each access is owner-scoped; non-owned and nonexistent record IDs return 404. Only `SAVED` can omit `applicationDate`.
- `ApplicationController` exposes `GET/POST /api/applications` and `GET/PUT/DELETE /api/applications/{id}`.
- `ApiExceptionHandler` returns JSON for validation errors (400 with `fieldErrors`), not-found/business errors (404/400), conflicts (409), and unexpected server errors (500, logged server-side).

The list endpoint returns an `ApplicationPageResponse` with `content` and pagination metadata. It accepts optional `q`, `status`, and `source` filters plus `page` and `size`; results are always restricted to the authenticated user. The React context loads pages in sequence so existing screens still have their full application list.

**Security note:** this project does not temporarily permit all requests. Application routes require the JWT bearer token so a test setting cannot accidentally leave private application data exposed. The Postman collection first verifies unauthenticated access is rejected, then registers/logs in and runs authenticated CRUD checks.

**Check with Postman:** missing company → 400 with a `companyName` message; create → 201; list/get/update/delete → expected success codes; missing token → 401. Run the full collection described in Part 2.

## DAY 4 — Registration and login (learning / implementation reference)

The finished authentication implementation is in `backend/src/main/java/com/interntrack/api/auth/`, with the user entity and repository in `backend/src/main/java/com/interntrack/api/user/`:

1. **Register:** `AuthService.register` trims and lower-cases email, checks for a duplicate (409), hashes the password with BCrypt, persists the user, and returns a signed token.
2. **Login:** `AuthService.login` normalizes the email, checks the password with `PasswordEncoder.matches`, and returns the same `Invalid email or password.` response for an unknown address and an incorrect password.
3. **JWT:** the token is signed by Spring Security's `JwtEncoder`; its subject (`sub`) is the user's database ID. It also carries `email` and `name` claims. Protected application endpoints use the subject ID to load the owner, so email is not used as an authorization identifier.
4. **Password storage:** the entity stores `password_hash`; only the BCrypt result is persisted. The API never returns the hash.

**Check with Postman:** successful registration returns a token; registering the same email again returns 409; wrong password returns 401 with the generic message. The collection checks the JWT subject against the returned user ID. In Workbench, inspect `users.password_hash` and confirm it has a BCrypt prefix such as `$2a$10$`—do not expose or share the stored hash.

Focused service tests are in `backend/src/test/java/com/interntrack/api/auth/AuthServiceTest.java`. They verify case normalization, BCrypt hashing, user-ID JWT subject, duplicate-email conflict, and the generic wrong-password/unknown-email error.

## DAY 5 — Secure the API and enforce ownership (learning / implementation reference)

The bearer-token filter is supplied by Spring Security's OAuth2 Resource Server support; this project does not need a separate hand-written `JwtAuthFilter`. `SecurityConfig` configures that filter to validate signed JWTs, keeps sessions stateless, disables CSRF for this bearer-token API, allows registration/login, and requires authentication for all other routes. Authentication failures return a JSON 401 response.

`JwtUserIdAuthenticationConverter` converts the verified token subject to the numeric user ID principal. Controllers receive it as `@AuthenticationPrincipal Long userId`. Application reads, updates, and deletes use the repository's owner-scoped `findByIdAndUser_Id(id, userId)` query, returning 404 if the record does not belong to that user. Creation assigns the authenticated user as the application owner; list queries are likewise scoped by user ID. The entity field maps to the existing `user_id` database column.

**Check with Postman:** the collection first confirms a protected request without a token returns JSON 401. It creates an application as user A, registers user B, then checks that B receives 404 for GET, PUT, and DELETE on A's application (TC-04). It switches back to A to complete the normal CRUD checks. Focused ownership tests are in `backend/src/test/java/com/interntrack/api/application/ApplicationServiceTest.java`.

## DAY 6 — Dashboard, reminders, search/filter, and CORS (learning / implementation reference)

- `GET /api/dashboard/stats` returns the authenticated user's total, zero-filled `countsByStatus`, and up to five most recent applications in `recent`.
- `GET /api/reminders/upcoming?limit=8` returns up to eight of that user's follow-ups and interviews scheduled for today or later, in ascending date/time order. The requested limit must be between 1 and 100.
- `GET /api/applications` supports `q`, `status`, `source`, `page`, and `size` query parameters. A JPA `Specification` combines these filters with the mandatory owner-ID predicate; search matches company or job title, and page sizes are limited to 100.
- CORS uses `app.cors.allowed-origins`, which defaults to `http://localhost:5173`. Override it with `CORS_ALLOWED_ORIGINS` only when the frontend runs on another origin.
- `JacksonConfig` maps empty date/date-time strings to `null`, so optional HTML date inputs can be sent as `""`.

**Check with Postman:** the collection checks dashboard totals/status counts, reminders and ordering/limit, filtered paginated results, and creates/deletes an application with empty date strings. The dashboard and reminders endpoints require the same bearer token as application routes.

## DAY 7 — Review and first React connection

The React app already uses the API for login and application CRUD. The shared fetch helper is `src/api/client.js`; `src/services/api.js` wraps it to attach the stored bearer token and translate API errors. The Login page calls the backend through `AuthContext`, so the smoke test is: start MySQL and the API, run `npm run dev`, open the Vite page, and log in with a registered account. A successful response stores the token and redirects to the dashboard. Do not print the bearer token to the console or share it; confirm success from the redirect and authenticated dashboard instead.

The Postman collection has 22 requests and 50 assertions, covering authentication, protected access, application CRUD and ownership, dashboard counts, upcoming reminders, filtered/paginated listing, and empty optional date fields. Run it from Postman's Runner while the API and MySQL are running. Source-level tests and collection-script validation do not substitute for this live end-to-end run. TC-04's other-user GET/PUT/DELETE checks are labeled in the collection; the TC-07 reminders check is request 17. TC-08/09/10 are outside Week 2 and remain Week 4 extension work. The project report PDF was not present in this workspace, so confirm the exact TC-01…TC-06 numbering against your report before marking those IDs complete.

The API reference is in `README.md`. The live Postman suite and browser smoke test still need to be run on the machine with MySQL configured. After those pass, review `git status`, confirm `application-local.properties` is ignored, then commit and push the project.

## PART 3 — Project setup + database (≈ 2–3 h, rebuild / learning path)

This part is for learning by rebuilding in a **separate fresh folder**. Keep the finished `backend/` as your answer key. Do not generate a starter project over the existing backend.

1. Go to [start.spring.io](https://start.spring.io) and select:
   - Project: **Maven**
   - Language: **Java**
   - Spring Boot: choose **3.4.x** to match this project's [pom.xml](./backend/pom.xml) (the finished backend currently uses 3.4.4)
   - Packaging: **Jar**
   - Java: **17**
   - Group: `com.interntrack`
   - Artifact: `interntrack-api`
   - Dependencies: **Spring Web**, **Spring Data JPA**, **MySQL Driver**, **Validation**, and **Spring Security**

   Generate, unzip to a new learning folder, then open that folder in IntelliJ. You can use Spring Boot 3.3.x if that is a course requirement, but it will not exactly match the finished project's Spring Boot version.
2. **JWT dependency note:** the finished project's `pom.xml` does **not** contain JJWT (`jjwt-api`, `jjwt-impl`, or `jjwt-jackson`). It uses `spring-boot-starter-oauth2-resource-server`, which brings in Spring Security's JWT encoder/decoder support. To rebuild this project consistently, add that same Spring Boot starter dependency instead of copying JJWT dependencies. The finished app's `JwtEncoder` and `JwtDecoder` configuration is in `backend/src/main/java/com/interntrack/api/config/SecurityConfig.java`. If a course explicitly requires JJWT, add its three `0.12.6` dependencies to the separate learning project and follow a JJWT-specific implementation; do not mix JJWT examples with the existing encoder/decoder code.
3. **Create the database:** in MySQL Workbench, open and run `backend/sql/create_database.sql` (or make an equivalent `CREATE DATABASE interntrack;` script in your fresh project). Refresh Schemas and confirm `interntrack` appears.
4. **Configure the data source:** copy `backend/src/main/resources/application-local.properties.example` to `application-local.properties` in the new project's `src/main/resources/`. Set `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`, `spring.jpa.hibernate.ddl-auto=update`, JWT secret, and CORS origin. The example local settings file is git-ignored in this project; configure the same ignore rule in your learning project. Never commit your database password or local JWT secret.
5. **Create package folders:** the suggested layered layout is `config`, `controller`, `dto`, `exception`, `model`, `repository`, `security`, and `service` under `com.interntrack.api`. The finished project instead groups related types by domain: `application`, `auth`, and `user`, with shared `config` and `common` packages. Both are valid; when comparing your rebuild with the answer key, map controller/DTO/service/repository responsibilities to those domain packages.
6. Start the app from IntelliJ. At this early stage, Spring Security may log a generated development password; that is expected until you implement your own authentication. Once JWT security is configured, use the app's configured bearer-token flow instead.

**Check:** Maven dependencies finish syncing, the application starts without datasource or configuration errors, and MySQL Workbench shows the `interntrack` schema. After adding entities and running JPA, refresh to see the tables.
