# 🌿 EcoSurvey — Environmental Awareness Survey Portal

A full-stack web application for managing environmental awareness surveys, tracking student/staff participation, and gamifying sustainability with a points-based leaderboard.

---

## ✨ Recent Major Updates & Improvements (v2.2)

### 🎨 1. Landing Page Refactoring & Componentization
- **Modular Component Architecture**: Extracted repetitive blocks into reusable subcomponents (`SectionHeader`, `FeatureCard`, `TrendingSurveyCard`, `StepCard`, `FaqItem`).
- **Brutalist Hover Animations**: Added interactive hover states (`card-hover`) with brutalist shadow shifts and micro-translations across all cards (Trending Surveys, Features, Steps, and Live Feed).
- **Repeatable Animations**: Configured scroll-triggered animations (`useInView`) to smoothly replay when scrolling up/down.
- **CTA & Layout Fixes**: Fixed section spacing (`py-14 sm:py-20`), eliminated div overlaps, and wrapped CTA title badges into distinct inline-blocks.

### 📱 2. Responsive Design & Mobile Drawer Navigation
- **Hamburger Mobile Menu**: Added an interactive mobile navigation drawer (`Menu` / `X` toggle) to both `Navbar` and `LandingPage` headers for mobile/tablet devices.
- **Language Switch Fixes**: Fixed layout breaking when switching between English and Vietnamese (`i18n`). Added `.no-scrollbar` utility to eliminate dark browser OS scrollbars on navigation containers.

### 🛡️ 3. Admin Navigation & Dashboard Enhancement
- **Exact Path Matching**: Added `end={true}` to `NavLink` in `Navbar` so `/admin` is only active when at exact Dashboard URL, fixing persistent green active indicators on sub-routes.
- **EcoTheme StatCard Icons**: Updated Admin Dashboard `StatCard` icon badges to use EcoTheme colors (`bg-earth-forest`, `bg-earth-terracotta`, `bg-earth-moss`, `bg-earth-clay`) for clear visibility in both Light & Dark modes.
- **Admin Security Center**: Dedicated profile panel for Admin users with account details, email verification status, auth method indicators, and password change modal.

### 🔤 4. Vietnamese Diacritics & Font Support
- **Playfair Display Integration**: Included `Playfair Display` with `vietnamese` subset in Google Fonts to ensure complete diacritic rendering for uppercase Vietnamese headings (e.g., "KHẢO SÁT").

---

## 🌟 Core Features

| Feature | Description |
|---|---|
| 🔐 **Advanced Security** | JWT Auth, Cloudflare Turnstile CAPTCHA, Redis Rate Limiting (1-min windows), Helmet CSP |
| 🛡️ **Admin Security Center** | Dedicated profile panel for Admin with account info, password management, and auth method status |
| 🔑 **Google OAuth** | Seamless login with Google accounts |
| 🌐 **Multi-language (i18n)** | Full English & Vietnamese translation support across the platform |
| 📱 **Responsive & Mobile Menu** | Mobile hamburger drawer navigation & flexible brutalist layouts |
| 🗄️ **Database Migrations** | Robust schema management using Sequelize CLI migrations |
| ✉️ **Account Recovery** | Forgot Password flow & Email Verification upon registration |
| 📋 **Survey System** | Create surveys with Text, Single-Choice, Multi-Choice questions & strict access controls |
| 📊 **Survey Analytics** | Per-question visual analytics & charts using **Recharts** |
| 📁 **Participation Reports** | Submit activity reports with file evidence (image/PDF) |
| 🔔 **Realtime Notifications** | Instant alerts via **Socket.io** when reports are graded or surveys published |
| 🏆 **Leaderboard** | Real-time rankings by week / month / all-time |
| 🤖 **AI Assistant** | Gemini-powered FAQ chatbot (mock fallback when no API key) |
| 📤 **Export** | Excel (.xlsx) for survey results, PDF for participation reports |
| 🌙 **Dark Mode** | Full dark/light theme with user preference persistence |
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

---

## 🏆 Points System

| Action | Points |
|---|---|
| Complete a survey | +10 points |
| Survey opinion scored by Admin | 0 - 10 Bonus points |
| Approved participation report | +50 points |

---

## 📄 License

This project is developed for educational purposes as part of an eProject assignment.