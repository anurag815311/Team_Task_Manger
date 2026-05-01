# Team Task Manager

A full-stack project management and task tracking application built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS v4.

## Features

- **Authentication:** JWT-based signup and login.
- **Projects:** Create projects, add/remove members, and assign roles.
- **Tasks:** Create, edit, delete, and track tasks. Assign priorities and status (To Do, In Progress, Done).
- **Dashboard:** Interactive charts and analytics using Recharts.
- **Role-based Access:** Admins have full control over their projects; Members can only modify the status of their assigned tasks.
- **Modern UI:** Glassmorphism design, responsive layouts, and animations.

## Tech Stack

- **Frontend:** React (Vite), React Router DOM, Axios, Recharts, Tailwind CSS v4
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB URI (Atlas)

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment variables are already set up in `backend/.env`. (Default MongoDB URI is `mongodb://localhost:27017/team-task-manager`).
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run on http://localhost:5000*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The application will run on http://localhost:3000*

---

## 🌐 Deployment Notes

- **Backend (Railway / Render / Heroku):** The backend is ready to be deployed. Ensure `process.env.MONGODB_URI` and `process.env.JWT_SECRET` are configured in your deployment platform's environment variables.
- **Frontend (Vercel / Netlify):** Change the `VITE_API_URL` in your `.env` file (or deployment environment variables) to point to your deployed backend URL.

## Folder Structure

```
Team_Task_Manger/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Route logic
│   │   ├── middleware/   # Auth and Error handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routes
│   │   ├── utils/        # Helper functions
│   │   ├── app.js        # Express app setup
│   │   └── server.js     # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/          # Axios interceptors & endpoints
    │   ├── components/   # Reusable UI components
    │   ├── context/      # React Context (Auth)
    │   ├── pages/        # Application views
    │   ├── App.jsx       # Main application component
    │   ├── index.css     # Tailwind and custom styles
    │   └── main.jsx      # React entry point
    ├── vite.config.js    # Vite configuration
    └── package.json
```
