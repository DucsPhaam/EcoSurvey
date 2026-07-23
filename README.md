# 🌿 EcoSurvey — Environmental Awareness Survey Portal

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack web application designed for educational institutions to manage environmental awareness surveys, monitor student/staff participation, visualize analytical data, and gamify sustainability with interactive leaderboards and achievements.

---

## ✨ Outstanding Features (v2.0 Overhaul)

### 🔐 Advanced Security & Hardening
- **Cloudflare Turnstile Defense**: Bot protection on registration, login, and survey submission endpoints.
- **Redis Rate Limiting**: Targeted request limiting for Authentication (10 req/15m), Survey Submissions (5 req/m), and Global requests (100 req/15m).
- **Google OAuth 2.0**: Seamless Single Sign-On (SSO) integration powered by Passport.js.
- **Password Recovery & Verification**: Token-based forgot password recovery flow (15-min TTL) and registration email verification.
- **Strict Input Sanitization & CSP**: Unified request validation schemas (`express-validator`), XSS filtering (`xss`), and dynamic Content Security Policy headers (`Helmet`).

### 🎨 Modern UI/UX, Accessibility & i18n
- **Brand New Design Language**: Completely overhauled sleek, responsive interface with Dark/Light theme toggles.
- **Accessibility Compliance (a11y)**: Full ARIA labels (`aria-label`, `aria-describedby`), focus-trap modal dialogs, visible focus indicators, and screen reader compatibility.
- **Multi-language Support (i18n)**: Instant switching between **Vietnamese** and **English** (`react-i18next`).

### 📊 Analytics, Maps & Cloud Integration
- **Per-Question Interactive Analytics**: Dynamic data charts (`Recharts`) for survey administrators to analyze response distributions.
- **Geolocation & Heatmap**: Survey response geotagging (Browser Geolocation API) with an interactive spatial heatmap for admins (`Leaflet Map`).
- **Cloud Media Storage**: Integrated Cloudinary Cloud Storage SDK for uploading user avatars and participation evidence.

### 🏆 Gamification, Rewards & Reporting
- **Badges & Achievements Engine**: Unlockable sustainability badges (*First Step*, *Eco Warrior*, *Century Mark*, *Top 10*) triggered automatically upon activity.
- **Monthly Challenges**: Time-limited sustainability challenges with bonus point rewards.
- **PDF Certificate Export**: Generated official PDF completion certificates for top users (`PDFKit`).
- **Admin Excel Bulk Import**: Bulk user account creation via Excel file upload (`.xlsx`).
- **Real-Time Notification Center**: Background-polled navbar notification center with read/unread tracking and Socket.io events.
- **AI Assistant Chatbot**: Interactive Gemini-powered sustainability assistant directly on the landing page.

---

## 🛠 Technology Stack

| Layer | Technologies & Tools |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Leaflet, Socket.io-client, i18next, Lucide Icons |
| **Backend** | Node.js, Express.js, Sequelize ORM, Socket.io, Passport.js, Winston, Nodemailer, PDFKit, ExcelJS |
| **Database & Caching** | MySQL 8.0, Redis |
| **Security & Auth** | JWT (HttpOnly Cookies), Cloudflare Turnstile, express-rate-limit, Helmet, express-validator, xss |
| **Testing** | Jest, Supertest (Backend Integration) / Vitest, React Testing Library (Frontend) |
| **Cloud Services** | Cloudinary (Media Storage), OpenRouter API / Gemini AI |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 📁 Repository Structure

```
EcoSurvey/
├── backend/                  # Node.js + Express API Backend
│   ├── __tests__/            # Jest & Supertest Integration Tests
│   ├── src/
│   │   ├── config/           # Database, Cloudinary, Passport, & Redis Configs
│   │   ├── controllers/      # API Request Handlers
│   │   ├── middleware/       # Turnstile, Rate Limiters, Validators, Auth Middleware
│   │   ├── models/           # Sequelize Database Models & Associations
│   │   ├── routes/           # Express Route Definitions
│   │   ├── services/         # Badge, Email, Storage, & Cron Services
│   │   └── server.js         # Express App Initialization & Socket.io Server
│   ├── Dockerfile
│   └── package.json
├── frontend/                 # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/       # Shared UI, Layout, Modal, & Accessibility Components
│   │   ├── contexts/         # Auth, Notification, & Theme Contexts
│   │   ├── i18n/             # English & Vietnamese Translations (en.json, vi.json)
│   │   ├── pages/            # Student, Admin, Auth, & Analytics Views
│   │   ├── services/         # Axios API Service Modules
│   │   └── setupTests.js     # Vitest Setup & RTL Testing Utilities
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/                 # MySQL Schema & Seed Data
│   └── init.sql
├── docker-compose.yml        # Full-Stack Orchestration (DB + Redis + Backend + Frontend)
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL**: v8.0 running on `localhost:3306` (or `3307`)
- **Redis**: Running on `localhost:6379` (for Rate Limiting)

### 1. Database Setup
Import the database schema and default seeds:
```bash
mysql -u root -p < database/init.sql
```

### 2. Backend Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Run dev server with Nodemon
npm run dev
```
Backend API runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend Web App runs at: `http://localhost:3000`

---

## 🐳 Docker Deployment (Full Stack)

Launch the entire stack (MySQL + Redis + Backend + Frontend Nginx) with a single command:

```bash
# Copy root environment file
cp backend/.env.example .env

# Edit .env with your environment credentials (Turnstile, Cloudinary, Google OAuth)

# Build and start containers in background
docker-compose up --build -d
```

### Exposed Endpoints:
- **Frontend App**: `http://localhost:8080` (Port 80 internally mapped via Nginx)
- **Backend API**: `http://localhost:5000/api`
- **MySQL DB**: `localhost:3307`
- **Redis Cache**: Internal Docker network (`redis:6379`)

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests (Jest + Supertest)
```bash
cd backend
npm test
```
*Tests cover: Registration & Login flows, Turnstile verification, Survey submissions, Admin RBAC guards, Leaderboard ranking, and Rate limit blockages.*

### Frontend Component Tests (Vitest + Testing Library)
```bash
cd frontend
npm test
```
*Tests cover: AuthContext state management, ProtectedRoute authorization guards, Form validations, and Accessibility DOM rendering.*

---

## 🔑 Demo User Accounts

> **Default password for all demo accounts**: `Admin@123456`

| Username | Role | Status | Description |
|---|---|---|---|
| `admin` | Admin | Approved | System Administrator with full access |
| `nva_student` | Student | Approved | Active Student account |
| `pcb_staff` | Staff | Approved | Active Staff account |
| `ttb_student` | Student | Pending | Awaiting Admin Approval |
| `lvc_student` | Student | Rejected | Account rejected by Admin |

---

## 👥 User Roles & Workflow

```
[User Registration] ➔ [Email Verification Link] ➔ [Account Status: Pending]
                                                            │
                                                   [Admin Review]
                                                      ┌─────┴─────┐
                                                      ▼           ▼
                                                 [Approved]   [Rejected]
                                                      │           │
                                       (Full Access Enabled)  (Blocked)
```

| Role | Permissions & Capabilities |
|---|---|
| **Admin** | Create/manage surveys, inspect per-question analytics, review participation reports, import users via Excel, manage FAQs, view heatmaps, award points. |
| **Student / Staff** | Take published surveys, geotag responses, submit participation reports with file evidence, earn badges, compete on leaderboards, download certificates. |

---

## 🏆 Gamification & Points Model

| Activity | Reward / Trigger |
|---|---|
| **Complete Survey** | +10 Points |
| **Admin Opinion Rating** | 0 to 10 Bonus Points |
| **Approved Activity Report** | +50 Points |
| **First Survey Badge** | Completed 1st Survey |
| **Eco Warrior Badge** | Completed 10+ Surveys |
| **Top 10 Badge** | Achieved Top 10 on Global Leaderboard |

---

## ⚙️ Environment Configuration

Set the following keys in your `.env` file:

| Key | Description | Default / Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `DB_HOST` | MySQL database host | `localhost` or `db` |
| `DB_NAME` | Database name | `ecosurvey` |
| `JWT_SECRET` | Secret key for access token | Min 32 chars |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Backend Secret | `0x4AAAAAA...` |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Frontend Site Key | `0x4AAAAAA...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Cloud Name | `your_cloud_name` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |

---

## 📄 License

This project is open-source under the [MIT License](LICENSE). Developed for educational and sustainability initiatives.
