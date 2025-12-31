# Uyirgene Frontend

This is a small React + Vite frontend for the Uyirgene backend APIs.

Quick start:

1. cd frontend
2. npm install
3. npm run dev

The app runs on http://localhost:5173 and assumes the backend is available at http://localhost:8080.

Auth: the app uses HTTP Basic auth; on Login it sends a test request to `/api/auth/me` using a Basic Authorization header and stores the header in localStorage for subsequent requests.

Pages implemented:
- Login
- Courses list (enroll)
- Course details (videos list, update progress, download certificate)

Design: Material UI for simple, clear components and easy navigation.
