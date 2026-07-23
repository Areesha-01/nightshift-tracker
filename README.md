# NightShift — Team Task & Bug Tracker

A lightweight task and bug tracker built for 2amTechSystems' development team, inspired by tools like Jira and Trello.

## Project Info
- **Intern:** Areesha Chaudhry
- **Role:** Software Developer Intern
- **Duration:** 8 Weeks (6th July – 6th Sep 2026)
- **Reference:** REF/2AM/HR/26-025(1)

## Tech Stack
- MongoDB
- Express.js
- React.js
- Node.js
(MERN Stack)

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
(Link will be added after deployment in Week 8)