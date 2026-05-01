# 🚀 TaskFlow - Premium Team Task Manager

TaskFlow is a modern, full-stack project management and task tracking application built with the **MERN stack** (MongoDB, Express, React, Node.js). Featuring a beautiful glassmorphism design system, it allows teams to collaborate seamlessly with robust role-based access controls, dynamic dashboards, and real-time status tracking.

---

## ✨ Features

- **Premium UI/UX:** Stunning dark-mode aesthetic with vibrant gradients, glassmorphism cards, floating sidebars, and smooth micro-animations.
- **Secure Authentication:** JWT-based user authentication and password hashing using bcrypt.
- **Dashboard Analytics:** Interactive visual charts (Pie & Bar) and team performance tracking using Recharts.
- **Project Management:** Create workspaces, invite team members via email, and assign roles.
- **Task Tracking:** Full CRUD capabilities for tasks. Assign priorities (Low, Medium, High) and statuses (To Do, In Progress, Done).
- **Role-Based Access Control (RBAC):** 
  - **Admins:** Can create/delete projects, manage all team members, and have full control over all project tasks.
  - **Members:** Can view their assigned tasks and update task statuses.
- **Unified Deployment:** Configured to serve both the backend API and the compiled React frontend from a single Node.js server in production.

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS v4 (Custom premium design system)
- React Router DOM
- Axios (API Client)
- Recharts (Data visualization)
- React Hot Toast (Notifications)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- JSON Web Tokens (JWT) for secure sessions
- bcryptjs for password encryption

---

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)

### 1. Backend Setup
Open a terminal and navigate to the backend folder:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory (or use `.env.example` as a template):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```
Start the development server:
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
The UI will be available at `http://localhost:3000`.

---

## 🌍 Production Deployment (Render)

This application is configured for a **unified single deployment**, meaning the Node.js backend automatically serves the compiled React frontend. You do not need to host the frontend separately (e.g., on Vercel).

**Steps to deploy on Render:**
1. Push this entire repository to GitHub.
2. Log in to [Render.com](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service exactly as follows:
   - **Root Directory:** *(Leave this completely blank!)*
   - **Environment:** `Node`
   - **Build Command:** 
     ```bash
     npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
     ```
   - **Start Command:** 
     ```bash
     npm start --prefix backend
     ```
5. Scroll down to **Environment Variables** and add:
   - `PORT` : `5000`
   - `MONGODB_URI` : *(Your MongoDB Atlas Connection String)*
   - `JWT_SECRET` : *(A secure random string)*
6. Click **Deploy**.

Once the build finishes, your app will be live and fully functional on a single URL!

---

## 📂 Project Structure

```text
Team_Task_Manger/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection logic
│   │   ├── controllers/  # Route logic/handlers
│   │   ├── middleware/   # JWT Auth & Error handlers
│   │   ├── models/       # Mongoose schemas (User, Project, Task)
│   │   ├── routes/       # Express API routes
│   │   ├── utils/        # Helper functions
│   │   ├── app.js        # Express app config & frontend static serving
│   │   └── server.js     # Server initialization
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/          # Axios interceptors & endpoint wrappers
    │   ├── components/   # Reusable UI (Layout, Modals, ProtectedRoutes)
    │   ├── context/      # React Context for Auth State
    │   ├── pages/        # Views (Login, Dashboard, Projects, Tasks)
    │   ├── App.jsx       # Root component & Routing
    │   ├── index.css     # Tailwind v4 configuration & base styles
    │   └── main.jsx      # React entry point
    ├── vite.config.js    # Vite bundler configuration
    └── package.json
```
