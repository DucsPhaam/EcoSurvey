# 🌿 EcoSurvey — Environmental Awareness Survey Portal

A full-stack web application for managing environmental awareness surveys, tracking student/staff participation, and gamifying sustainability with a points-based leaderboard.

---

## ✨ Features (Updated for v2.0)

| Feature | Description |
|---|---|
| 🔐 **Advanced Security** | JWT Auth, Cloudflare Turnstile CAPTCHA, Redis Rate Limiting (1-min windows), Helmet CSP |
| 🛡️ **Admin Security Center** | Dedicated profile panel for Admin with account info, password management, and auth method status |
| 🔑 **Google OAuth** | Seamless login with Google accounts |
| 🌐 **Multi-language (i18n)** | Full English & Vietnamese translation support across the platform (synced across all new features) |
| 🗄️ **Database Migrations** | Robust schema management using Sequelize CLI migrations |
| ✉️ **Account Recovery** | Forgot Password flow & Email Verification upon registration |
| 📋 **Survey System** | Create surveys with Text, Single-Choice, Multi-Choice questions |
| 📊 **Survey Analytics** | Per-question visual analytics & charts using **Recharts** |
| 📁 **Participation Reports** | Submit activity reports with file evidence (image/PDF) |
| 🔔 **Realtime Notifications** | Instant alerts via **Socket.io** when reports are graded or surveys published |
| 🏆 **Leaderboard** | Real-time rankings by week / month / all-time |
| 🤖 **AI Assistant** | Gemini-powered FAQ chatbot (mock fallback when no API key) |
| 📤 **Export** | Excel (.xlsx) for survey results, PDF for participation reports |
| 🌙 **Dark Mode** | Full dark/light theme with user preference persistence |
| 📧 **Email Notifications** | Account, recovery & report status emails |
| 🐳 **Docker** | Full Docker Compose setup with MySQL + Redis + Backend + Frontend |
| 🧪 **Automated Testing** | Comprehensive test coverage using **Jest**, **Supertest**, **Vitest**, & **RTL** |

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + Recharts + Socket.io-client + i18next |
| **Backend** | Node.js + Express.js + Sequelize ORM + Socket.io + Passport.js |
| **Database** | MySQL 8.0 |
| **Cache/RateLimit** | Redis |
| **Auth** | JWT (Access token 15m + Refresh 7d HttpOnly cookie) + Google OAuth 2.0 |
| **Security** | Cloudflare Turnstile, express-rate-limit, Helmet, express-validator |
| **Testing** | Jest, Supertest (Backend) / Vitest, React Testing Library (Frontend) |
| **AI** | OpenRouter API (`gemini-2.5-flash`) |
| **Container** | Docker + Docker Compose |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MySQL 8.0 running locally
- Redis running locally (for Rate Limiting)

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

# Install dependencies
npm install

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend

# Copy and edit environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🐳 Docker (Full Stack)

```bash
# Create an environment file at the root level
cp backend/.env.example .env

# Edit .env (at root level) with your secrets (including Turnstile keys)
# TURNSTILE_SECRET_KEY=...
# VITE_TURNSTILE_SITE_KEY=...

# Build and start all services
docker-compose up --build -d
```

Services:
- **Frontend**: http://localhost:8080 (Mapped to port 80 internally)
- **Backend API**: http://localhost:5000/api
- **MySQL**: localhost:3307
- **Redis**: internal only

---

## 🧪 Running Tests

### Backend Tests (Jest + Supertest)
```bash
cd backend
npm test
```
Tests cover: Authentication flows, Survey submission, Admin actions, Leaderboard, and Rate Limiting.

### Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
Tests cover: AuthContext, ProtectedRoutes, Form rendering, and Interactions.

---

## 🔑 Default Demo Accounts

> Password cho tất cả tài khoản demo: **`Admin@123`**

| Username | Role | Status |
|---|---|---|
| `admin` | Admin | Approved |
| `nva_student` | Student | Approved |
| `pcb_staff` | Staff | Approved |
| `ttb_student` | Student | Pending |
| `lvc_student` | Student | Rejected |

> ⚠️ **Đổi mật khẩu admin ngay sau lần đăng nhập đầu tiên ở môi trường production.**

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manage users, create/publish surveys, review reports, manage FAQs, view analytics, export data |
| **Student** | Take surveys, submit activity reports, view leaderboard & personal dashboard |
| **Staff** | Same as Student |

### Registration Flow
1. User registers & completes Cloudflare Turnstile CAPTCHA.
2. User receives an Email Verification link and verifies email.
3. Account status becomes **Pending**.
4. Admin reviews and **Approves** or **Rejects**.
5. Approved users receive an email notification and can log in.

---

## 🏆 Points System

| Action | Points |
|---|---|
| Complete a survey | +10 points |
| Survey opinion scored by Admin | 0 - 10 Bonus points |
| Approved participation report | +50 points |

---

## 🔧 Environment Variables (Root `.env`)

When using Docker Compose, place the `.env` at the root folder:

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL host (use `db` in Docker) |
| `DB_NAME` | Database name |
| `MYSQL_ROOT_PASSWORD` | Root password for MySQL |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional) |
| `SMTP_HOST` | Email server host (for real emails) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Backend Secret Key |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Frontend Site Key |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `CLIENT_URL` | Frontend URL for Google OAuth callback redirect (e.g. `http://localhost:8080`) |

---

## 📄 License

This project is developed for educational purposes as part of an eProject assignment.

## đây là PE chính