# Uyirgene Frontend

Small React + Vite frontend for the Uyirgene backend APIs.

## What’s included ✅
- User registration and login (HTTP Basic auth) — login stores the `Authorization` header in `localStorage` (key: `uyir_auth`).
- Course listing and detail pages (videos, progress tracking).
- Enroll flow:
  - Free courses: immediate enrollment and confirmation email (backend).
  - Paid courses: Razorpay checkout flow (frontend opens checkout when backend returns an order), then payment confirmation back to the backend.
- My Courses page to view courses the logged-in user is enrolled in.
- Certificate download (authenticated download via axios blob fetch).
- Material UI design system and responsive layout.

---

## Local setup and running 🧑‍💻
1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start dev server:

```bash
npm run dev
```

- Default dev server URL: `http://localhost:5173/` (Vite may pick the next free port if 5173 is in use).
- To build for production:

```bash
npm run build
```

- To preview a production build locally:

```bash
npm run preview
```

---

## Configuration & environment 🔧
- API base URL is configured in `src/api.js` as `baseURL: 'http://localhost:8080'` — change this to point to your backend if needed.
- Auth handling:
  - `src/api.js` exposes helpers `setAuthHeader(token)` and `clearAuthHeader()` which persist and set the `Authorization` header for axios requests (the app uses Basic auth: `Basic base64(email:password)`).
- CORS: backend must allow the frontend origin (by default `http://localhost:5173`) — the backend has a `CorsConfig` to allow that origin in dev.

### Backend env variables (for full end-to-end features)
- Razorpay (for paid enrollment): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (backend picks these up; add in backend config or environment)
- Email (to send enrollment confirmation): `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`

> Note: The frontend itself does not require these env vars — they are required by the backend to enable payment and email.

---

## How the flows work 🎯
- Login: the Login page calls `GET /api/auth/me` with a Basic `Authorization` header (email:password). On success, the header is saved and used automatically for subsequent requests.
- Registration: POST `/api/auth/register` (Register page sends `name`, `email`, `password`, `role`).
- Courses list: GET `/api/courses` (public).
- Enroll:
  - POST `/api/courses/{id}/enroll` — backend returns either immediate enrollment or a Razorpay order object for paid courses.
  - If an order is returned, frontend opens the Razorpay checkout and on success calls `POST /api/courses/{id}/enroll/confirm` with payment details.
- My Courses: GET `/api/courses/enrolled` (requires auth).
- Certificate: `GET /api/courses/{id}/certificate` is downloaded via an authenticated axios blob call so auth headers are sent.

---

## Testing payments locally 🔁
- If you don't have Razorpay keys set up, the app supports a mock payment flow for development (frontend/backend may simulate a payment and call the confirm endpoint). For real payments, configure Razorpay keys on the backend.

---

## Troubleshooting & tips 🛠️
- If you see CORS errors, ensure backend accepts `http://localhost:5173` (or the port Vite is using).
- If `Authorization` is not sent, open `src/api.js` and verify `UYIR_AUTH` or `uyir_auth` token is present in `localStorage` (login sets it automatically).
- If checkout doesn't open, confirm the backend returned an order object (`orderId`, `amount`, `currency`, `keyId`).

---

## Development notes for contributors
- Tests: some components have unit tests under `src/__tests__` (Vitest + React Testing Library).
- Linting: ESLint config present (`.eslintrc.cjs`).
- Docker/Nginx: there is a `Dockerfile` and an `nginx.conf` for production builds.

---

If you'd like, I can also add an environment-mode example (`.env.local`) and a short guide for integrating Razorpay test keys and a test SMTP account.
