# NightShift — Team Task & Bug Tracker

A lightweight task and bug tracker built for 2amTechSystems' development team, inspired by tools like Jira and Trello.

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

## Branching Strategy
- main — production-ready, stable code only
- develop — active development branch
- feature/* — individual feature branches (merged into develop)

## Features
- User authentication (register/login)
- Create, assign, edit, and delete tasks
- Task board with To Do / In Progress / Done columns
- Comments on tasks
- Responsive UI

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/Areesha-01/nightshift-tracker.git
cd nightshift-tracker

### 2. Backend setup
cd backend
npm install

Create a .env file inside the backend folder with the following variables:
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

Run the backend server:
npx nodemon server.js

The backend will run on http://localhost:5000

### 3. Frontend setup
Open a new terminal:
cd frontend
npm install
npm run dev

The frontend will run on http://localhost:5173

### 4. Usage
- Register a new account at /register
- Log in at /login
- You will be redirected to the dashboard on successful login

## Live Demo
- Frontend: https://nightshift-tracker.vercel.app
- Backend API: https://nightshift-api-ezqw.onrender.com/api
## Testing
The backend includes an automated test suite (Jest + Supertest) covering authentication and task endpoints, including validation errors, unauthorized access, and field-level security checks. Run it with:

    cd backend
    npm test

A coverage report is generated in `backend/coverage/`.