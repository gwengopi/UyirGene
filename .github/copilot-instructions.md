# Copilot / AI Agent instructions for Uyirgene 🚀

## Quick summary
- Backend: Spring Boot (Java 17) REST API with feature packages (course, user, blog). Frontend: Vite + React in `frontend/`.
- Auth: HTTP Basic (email as username) and role checks with `@PreAuthorize` (ADMIN/INSTRUCTOR/STUDENT).
- DB: PostgreSQL (config in `src/main/resources/application.yml`), tests use H2.
- Important integrations: Razorpay (payment) and SMTP (Spring Mail via `MailService`).

---

## Useful files & entry points 🔍
- `src/main/java/com/uyirgene/UyirgeneApplication.java` — app entry
- `src/main/resources/application.yml` — DB, mail, Razorpay keys and server port
- `src/main/java/com/uyirgene/security/SecurityConfig.java` — security rules (HTTP Basic, allowed endpoints)
- `src/main/java/com/uyirgene/config/CorsConfig.java` — CORS allows `http://localhost:5173` (Vite)
- `src/main/java/com/uyirgene/course/PaymentService.java` — Razorpay calls (RestTemplate)
- `src/main/java/com/uyirgene/course/MailService.java` — loads `templates/enrollment-success.html`
- `frontend/src/api.js` & `frontend/src/pages/Login.jsx` — how frontend sets `Authorization: Basic ...`
- `pom.xml` — Java 17, Spring Boot 3.3.x, Lombok, jacoco

---

## How to run locally (explicit commands) ⚙️
- Backend (needs JDK 17):
  - mvn test                # run unit tests (H2 used in test scope)
  - mvn clean package      # build jar
  - mvn spring-boot:run    # run app (reads `application.yml` / env vars)
  - Or: java -jar target/uyirgene-1.0.0.jar
- Frontend:
  - cd frontend
  - npm install
  - npm run dev            # Vite dev server on 5173
  - npm run build          # production build

Notes:
- CORS is configured for `http://localhost:5173` to make frontend <-> backend work during dev.
- To run both together: start backend on port 8080 and frontend dev server (5173).

---

## Required env vars & config (examples) 🔑
- Database: `DB_USERNAME`, `DB_PASSWORD` or edit `spring.datasource` in `application.yml`.
- Mail: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` (Spring Mail). `MailService` falls back to `noreply@uyirgene.local`.
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — used by `PaymentService`.
- Security: uses HTTP Basic auth — use email/password as credentials.

---

## Project conventions & patterns ✅
- Feature-based package layout (e.g., `course`, `user`, `blog`) — make changes within the same package if possible.
- Lombok is used widely (builders, `@RequiredArgsConstructor`) — ensure annotation-processing/Lombok plugin enabled in IDE.
- REST controllers live under `/api/*` and return domain entities directly (light DTO usage exists, e.g. `course.dto.EnrollmentResult`).
- Role checks use `@PreAuthorize` on controller methods (e.g., `hasRole('ADMIN')`).
- Email templates are simple placeholder substitution (look for `{{name}}`, `{{courseTitle}}` in `resources/templates`).

---

## Tests & debugging 🧪
- Unit tests: JUnit 5 (bundled with `spring-boot-starter-test`), Mockito and AssertJ are used (see `src/test/java/...`).
- Typical test pattern: mock repositories and `CurrentUserService` (see `EnrollmentServiceTest`).
- Coverage: `jacoco-maven-plugin` configured; run `mvn test` to generate reports.
- Common local debugging tips:
  - Enable SQL logging is already on (`spring.jpa.show-sql: true` in `application.yml`).
  - If entity mapping/schema issues occur, note `spring.jpa.hibernate.ddl-auto: update` in dev (dangerous for prod).

---

## Integration notes & gotchas ⚠️
- Razorpay signature verification is performed in `EnrollmentService.confirmEnrollmentPayment` — keep secret keys private.
- `MailService` swallows send errors (prints stack trace) to avoid failing requests — expect silent failures in dev if SMTP misconfigured.
- Auth uses HTTP Basic and stores Authorization value in frontend (`localStorage` key `uyir_auth`) — frontend sets `Authorization` header as `Basic <base64(email:password)>` (see `Login.jsx`).
- CORS is permissive for the local frontend origin only — change when deploying front-end with a different origin.

---

## How AI agents should make edits 🛠️
- Preserve existing patterns: use Lombok where present, keep controllers/services in same feature package.
- For changes that alter authentication or CORS, update `SecurityConfig`/`CorsConfig` and add a test covering the behavior.
- When adding external keys or secrets, add `application.yml` placeholders and mention the required env var in the PR description.
- Tests should mock side-effecting integrations (mail, payments, external HTTP) — see existing tests for approach.

---

If anything is missing or you'd like more examples (e.g., typical PR checklist, deployment notes), tell me which area to expand and I will iterate. 🙋‍♂️
