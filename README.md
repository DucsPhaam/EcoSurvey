# 🌿 EcoSurvey — Environmental Awareness Survey Portal

A full-stack web application for managing environmental awareness surveys, tracking student/staff participation, and gamifying sustainability with a points-based leaderboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Access token + HttpOnly cookie refresh token, RBAC |
| 📋 Survey System | Create surveys with Text, Single-Choice, Multi-Choice questions |
| 📁 Participation Reports | Submit activity reports with file evidence (image/PDF) |
| 🏆 Leaderboard | Real-time rankings by week / month / all-time |
| 🤖 AI Assistant | Gemini-powered FAQ chatbot (mock fallback when no API key) |
| 📊 Analytics Dashboard | Recharts-based charts for admin overview |
| 📤 Export | Excel (.xlsx) for survey results, PDF for participation reports |
| 🌙 Dark Mode | Full dark/light theme with user preference persistence |
| 📧 Email Notifications | Account & report status emails (logs to console in dev mode) |
| 🐳 Docker | Full Docker Compose setup with MySQL + Backend + Frontend |

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express.js + Sequelize ORM |
| Database | MySQL 8.0 |
| Auth | JWT (Access token 15m + Refresh 7d HttpOnly cookie) |
| AI | OpenRouter API (`gemini-2.5-flash`) |
| Container | Docker + Docker Compose |
| File Storage | Local volume (dev) / configurable |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MySQL 8.0 running locally

### 1. Database Setup

```bash
# Create database and run seed data
mysql -u root -p < database/init.sql
```

### 2. Backend

```bash
cd backend

# Copy and edit environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Install dependencies
npm install

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🐳 Docker (Full Stack)

```bash
# Copy environment file
cp backend/.env.example .env

# Edit .env (at root level) with your secrets

# Build and start all services
docker-compose up --build

# Or in detached mode
docker-compose up -d --build
```

Services:
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000/api
- **MySQL**: localhost:3306

---

## 🔑 Default Admin Account

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin@123456` |

> ⚠️ **Change the admin password immediately after first login in production.**

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manage users, create/publish surveys, review reports, manage FAQs, view analytics, export data |
| **Student** | Take surveys, submit activity reports, view leaderboard & personal dashboard |
| **Staff** | Same as Student |

### Registration Flow
1. User registers → status = **Pending**
2. Admin reviews and **Approves** or **Rejects**
3. Approved users receive an email notification
4. User can log in after approval

---

## 🏆 Points System

| Action | Points |
|---|---|
| Complete a survey | +10 points |
| Approved participation report | +50 points |

---

## 📁 Project Structure

```
environmental-survey-portal/
├── database/
│   └── init.sql              # Schema + seed data
├── backend/
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, Role, Upload, RateLimit
│   │   ├── models/           # Sequelize models
│   │   ├── routes/           # Express routes
│   │   ├── services/         # AI, Email, Cron
│   │   ├── utils/            # Logger
│   │   └── server.js         # Express app entry
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Layout, UI, Features
│   │   ├── contexts/         # Auth, Theme contexts
│   │   ├── pages/            # All page components
│   │   └── services/         # Axios instance
│   ├── .env.example
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_NAME` | Database name | `ecosurvey_db` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional) | — |
| `SMTP_HOST` | Email server host (optional) | — |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `/api` (proxied via Vite) |

---

## 📡 API Reference (Key Endpoints)

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new account |
| POST | `/api/auth/login` | Login, returns access token + cookie |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Clear refresh cookie |

### Surveys
| Method | Path | Description |
|---|---|---|
| GET | `/api/surveys` | List published surveys |
| GET | `/api/surveys/:id` | Survey detail with questions |
| POST | `/api/surveys/:id/submit` | Submit answers |

### Admin
| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | List users with filters |
| PATCH | `/api/admin/users/:id/status` | Approve/Reject user |
| GET/POST | `/api/admin/surveys` | Manage surveys |
| PATCH | `/api/admin/participations/:id/review` | Review report |
| GET | `/api/export/surveys/:id/excel` | Export survey results |
| GET | `/api/export/participations/pdf` | Export approved reports |

---

## 🤖 AI Features

- **FAQ Chatbot**: Available to all logged-in users via the floating chat widget
- **Report Summarization**: Admin can generate AI summaries for participation reports
- **Mock Mode**: When `OPENROUTER_API_KEY` is not set, the system uses keyword-matching fallback

---

## 📧 Email Notifications

Emails are sent for:
- New account registration (to user)
- Account approval/rejection (to user)
- Participation report approval/rejection (to user)

> In development (no SMTP configured), emails are logged to the console.

---

## 🧑‍💻 Development Commands

```bash
# Backend
npm run dev        # Start with nodemon hot-reload
npm start          # Production start

# Frontend
npm run dev        # Vite dev server (port 3000)
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 📄 License

This project is developed for educational purposes as part of an eProject assignment.
