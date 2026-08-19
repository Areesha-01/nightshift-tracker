# NightShift — Team Task & Bug Tracker

A lightweight task and bug tracker built for 2amTechSystems' development team, inspired by tools like Jira and Trello.

## Live Demo
- **Frontend:** https://nightshift-tracker.vercel.app
- **Backend API:** https://nightshift-api-ezqw.onrender.com/api
- **GitHub Repository:** [github.com/Areesha-01/nightshift-tracker](https://github.com/Areesha-01/nightshift-tracker) (develop branch)
## Project Info
- **Intern:** Areesha Chaudhry
- **Role:** Software Developer Intern
- **Duration:** 8 Weeks (6th July – 6th Sep 2026)
- **Reference:** REF/2AM/HR/26-025(1)

## Tech Stack
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Nodemailer
- **Frontend:** React.js, Vite, React Router, Axios, HTML5 Drag-and-Drop API
- **Testing:** Jest, Supertest
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

## Features
- User authentication (register/login) with JWT
- Create, assign, edit, and delete tasks
- Task board with To Do / In Progress / Done columns
- Drag-and-drop between columns
- Priority levels, due dates, and assignee
- Search and multi-criteria filtering
- Comments on tasks
- Responsive UI
- Role-based access: Admin and Employee accounts
- New employee accounts require admin approval before gaining login access

## Branching Strategy
- `main` — production-ready, stable code only
- `develop` — active development branch
- `feature/*` — individual feature branches (merged into develop)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm
- A MongoDB Atlas account (or local MongoDB installation)

### 1. Clone the repository
```bash
git clone https://github.com/Areesha-01/nightshift-tracker.git
cd nightshift-tracker
```

### 2. Backend setup
```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your own values:
```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas (or local) connection string |
| `PORT` | Port for the backend server (default: 5000) |
| `JWT_SECRET` | Secret key used to sign JWT tokens |
| `EMAIL_USER` | Gmail address used to send welcome emails |
| `EMAIL_PASS` | Gmail App Password (not your regular password) |
| `ADMIN_SECRET_CODE` | Secret code required during registration to create an admin account (e.g. `nightshift_admin_2026`) |

Run the backend server:
```bash
npx nodemon server.js
```

The backend will run on `http://localhost:5000`.

### 3. Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
```

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (use `http://localhost:5000/api` for local development) |

Run the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 4. Running Tests
The backend includes an automated test suite (Jest + Supertest) covering authentication and task endpoints — 17 tests in total, including validation, authorization, and field-security checks.

```bash
cd backend
npm test
```

This runs the full suite with coverage and generates a report at `backend/coverage/lcov-report/index.html`.

### 5. Usage
- Register a new account at `/register`
- Log in at `/login`
- You will be redirected to the dashboard on successful login

## Known Limitations
- **MongoDB Atlas Network Access** is set to allow connections from anywhere (`0.0.0.0/0`), since Render's free tier uses dynamic outbound IP addresses that can't be individually whitelisted. For a production deployment at scale, Render's Static Outbound IPs feature (paid plans) would allow this to be restricted to specific IPs.
- **Render free tier cold starts:** the backend may take up to ~30 seconds to respond on the first request after a period of inactivity. A warm-up ping on app load helps reduce this in practice.

## API Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for the full list of endpoints, request formats, and response formats.

## User Guide
See [USER_GUIDE.md](./USER_GUIDE.md) for a walkthrough of how to use the application.