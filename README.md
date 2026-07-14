# 🚀 FlowSphere

**Manage Teams. Track Progress. Boost Productivity.**

FlowSphere is a production-ready, full-stack team collaboration and productivity platform built with React, Node.js, Express, MongoDB, and Socket.io. It features real-time updates, drag-and-drop Kanban boards, AI-powered suggestions, gamification, and a stunning modern UI.

---

## ✨ Features

### Core
- **Authentication** — JWT-based signup/login/logout with session persistence
- **Role-Based Access Control** — Admin & Member roles with middleware security
- **Project Management** — Create, edit, delete, star/favorite projects with progress tracking
- **Kanban Board** — Drag-and-drop task management across 4 status columns
- **Task Management** — Priorities, due dates, checklists, comments, assignments
- **Dashboard & Analytics** — Stats cards, weekly charts, activity feed, deadlines
- **Real-Time Updates** — Socket.io for live notifications and task sync
- **Team Leaderboard** — Gamified ranking with productivity scores and badges

### Unique Features
- **🧠 AI Smart Suggestions** — Rule-based priority, deadline, and assignee recommendations
- **🎯 Focus Mode** — Pomodoro timer with fullscreen distraction-free workspace
- **🔥 Daily Streak System** — Track consecutive productive days with badge milestones
- **🏆 Gamification** — Badges, achievements, and productivity scores
- **🎨 Theme System** — Dark/Light mode toggle with accent color options
- **🔔 Live Notifications** — Real-time notification system with Socket.io

### UI/UX
- Glassmorphism design with gradient accents
- Framer Motion animations throughout
- Skeleton loaders and empty states
- Responsive design (mobile, tablet, desktop)
- SaaS-quality landing page
- Premium typography with Inter font

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| State | Zustand, TanStack React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB (local / Atlas) |
| Real-time | Socket.io |
| Auth | JWT, bcryptjs |
| Charts | Recharts |
| DnD | @hello-pangea/dnd |

---

## 📦 Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd flowsphere

# 2. Install all dependencies
npm run install:all

# 3. Configure environment variables
# Edit server/.env with your MongoDB URI
# Default: mongodb://localhost:27017/flowsphere

# 4. Seed demo data
npm run seed

# 5. Start development servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flowsphere.com | admin123 |
| Member | sarah@flowsphere.com | member123 |
| Member | james@flowsphere.com | member123 |
| Member | maya@flowsphere.com | member123 |
---

## 🐳 Docker Setup

You can run the entire application, including the MongoDB database, inside Docker containers.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

### Quick Start with Docker Compose

1. **Start all services** (starts the app and local MongoDB):
   ```bash
   docker compose up --build -d
   ```
   *The app will build the React frontend and start the Express server on **http://localhost:5000**.*

2. **Seed the demo database**:
   Run the seeding script inside the running container to populate the demo projects and users:
   ```bash
   docker compose exec app npm run seed
   ```

3. **Log in**:
   Use the **Demo Credentials** below to log in on **http://localhost:5000**.

4. **Stop the services**:
   ```bash
   docker compose down
   ```

### Standalone Docker Image

If you want to build and run only the application container (pointing to an external MongoDB):

1. **Build the image**:
   ```bash
   docker build -t flowsphere .
   ```

2. **Run the container**:
   ```bash
   docker run -d -p 5000:5000 \
     -e MONGO_URI="your_mongodb_connection_string" \
     -e JWT_SECRET="your_jwt_secret" \
     flowsphere
   ```

---

## 🔧 Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flowsphere
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/forgot-password | Forgot password |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | Get all projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Get single project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| POST | /api/projects/:id/members | Add member |
| DELETE | /api/projects/:id/members/:userId | Remove member |
| PUT | /api/projects/:id/favorite | Toggle favorite |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get tasks (with filters) |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get single task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PUT | /api/tasks/reorder | Reorder tasks (DnD) |
| POST | /api/tasks/:id/comments | Add comment |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | Dashboard stats |
| GET | /api/analytics/weekly | Weekly progress |
| GET | /api/analytics/team | Team performance |
| GET | /api/analytics/activity | Recent activity |
| GET | /api/analytics/deadlines | Upcoming deadlines |

### Users & Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| PUT | /api/users/profile | Update profile |
| GET | /api/notifications | Get notifications |
| PUT | /api/notifications/read-all | Mark all read |

---

## 🚀 Deployment

### Frontend → Vercel
1. Connect your GitHub repository to Vercel
2. Set the root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend → Railway
1. Connect your GitHub repository to Railway
2. Set the root directory to `server`
3. Add environment variables in Railway dashboard
4. Start command: `npm start`

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com](https://www.mongodb.com/atlas)
2. Get the connection string
3. Update `MONGO_URI` in your environment variables

---

## 📁 Project Structure

```
flowsphere/
├── client/                # React + Vite Frontend
│   ├── src/
│   │   ├── api/           # Axios API calls
│   │   ├── components/    # Reusable components
│   │   │   ├── layout/    # Sidebar, Topbar, AppLayout
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── utils/         # Helpers & constants
│   │   ├── App.jsx        # Root component
│   │   └── main.jsx       # Entry point
│   └── index.html
│
├── server/                # Express.js Backend
│   ├── config/            # DB & Socket config
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth, RBAC, validation
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # AI, scoring, streaks
│   ├── seeds/             # Demo data seeder
│   └── server.js          # Entry point
│
├── package.json           # Root workspace
└── README.md
```

---

## 📄 License

MIT License — Built with ❤️ for modern teams.
