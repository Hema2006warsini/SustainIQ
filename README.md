# SustainIQ — Smart ESG Monitoring & Analytics Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

> **SustainIQ** is a genuine, full-stack Environmental, Social, and Governance (ESG) monitoring and analytics platform engineered for multi-tenant sustainability tracking, complete user-level data isolation, and cryptographic authentication.

---

## 🌟 Core Philosophy: Zero-Mock Data Policy & Strict Data Isolation

**SustainIQ contains ZERO fake data, ZERO seed data, ZERO hardcoded KPI numbers, and ZERO static ESG scores.**

* **Clean Slate Guarantee**: When a user registers a new account, they are welcomed with a clean dashboard:
  > *"No ESG data available yet. Add your first ESG record to start monitoring your organization's sustainability performance."*
* **Strict User-Level Data Isolation**: Every organization and ESG record belongs exclusively to its authenticated creator (`owner_id`). Users can only view, create, edit, and delete their own data. Changing an ID in an API request never leaks or exposes another user's organizations or telemetry.
* **100% Dynamic Telemetry**: Every KPI card, time-series chart, ESG pillar score, table row, and PDF report is derived **dynamically and exclusively** from user-submitted operational records stored in PostgreSQL.

---

## 🏛️ Application Architecture

```
User Browser (React 18 + TypeScript + Vite + Recharts + Lucide)
   │  ▲
   │  │  HTTP-Only Cookies (JWT) + CSRF Header Protection
   ▼  │
Express.js Backend (Node.js + TypeScript)
   ├── Auth Middleware (JWT Token Verification + Rate Limiting + CSRF Guard)
   ├── Input Validation (Zod Schemas)
   ├── Data Authorization (Ownership verification via req.user.id)
   ├── Transparent Scoring Engine (Mathematical ESG Formulas)
   ├── Vector PDF Generator (PDFKit Stream)
   ├── Redis Caching Layer (User-scoped keys: dashboard:user:{userId}:org:{orgId})
   └── Relational Storage (PostgreSQL Pool + Foreign Key Cascades + Parameterized SQL)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Modern CSS (Deep Slate / Emerald Glassmorphism), Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Zod Validation, Helmet, CORS with credentials, cookie-parser, express-rate-limit, PDFKit |
| **Database** | PostgreSQL 16+ (Relational tables: `users`, `organizations`, `esg_records` with foreign key cascades, indexes, JSONB) |
| **Authentication** | Secure bcrypt password hashing (12-round salt), JWT sessions, HTTP-only SameSite cookies, CSRF tokens |
| **Caching** | Redis 7 (User- and organization-scoped dashboard caching with automatic invalidation on CRUD operations) |
| **Deployment** | Docker, Docker Compose multi-container configuration |

---

## 📁 Project Structure

```
ESG DASHBOARD/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # PostgreSQL pool, schema migration, embedded standalone engine
│   │   │   └── redis.ts           # Redis client + user-scoped TTL caching + invalidation
│   │   ├── controllers/
│   │   │   ├── authController.ts          # Register, Login, Logout, /me
│   │   │   ├── organizationController.ts  # User-owned organizations CRUD
│   │   │   ├── esgRecordController.ts     # User-owned ESG records CRUD & scores
│   │   │   ├── dashboardController.ts     # KPIs, charts, Redis cached stats
│   │   │   └── reportController.ts        # Dynamic PDF reports
│   │   ├── middleware/
│   │   │   ├── auth.ts            # requireAuth middleware & CSRF protection
│   │   │   ├── rateLimiter.ts     # express-rate-limit for auth endpoints
│   │   │   ├── validation.ts      # Zod validation schemas
│   │   │   └── errorHandler.ts    # Global error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── organizationRoutes.ts
│   │   │   ├── esgRecordRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── scoringService.ts  # Transparent ESG score calculations
│   │   │   ├── dashboardService.ts# Aggregations, KPIs, trends
│   │   │   └── pdfService.ts      # Vector PDF report generator
│   │   ├── utils/
│   │   │   └── auth.ts            # Password hashing, JWT signing/verification, cookies
│   │   ├── scripts/
│   │   │   └── verifyIntegration.ts # Comprehensive 23-step automated verification test suite
│   │   ├── types/
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Navbar (with user badge & Logout), Sidebar, Layout
│   │   │   ├── dashboard/         # KpiCard, ScoreOverview, EmptyState, ExplainerModal
│   │   │   ├── charts/            # DashboardCharts (6 Recharts)
│   │   │   ├── records/           # RecordFormModal, RecordTable
│   │   │   ├── organizations/     # OrgFormModal
│   │   │   └── common/            # DeleteConfirmModal
│   │   ├── context/
│   │   │   ├── AuthContext.tsx         # User authentication state & session restore
│   │   │   └── OrganizationContext.tsx # User-scoped organization state & selection
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx           # Dedicated login page with show/hide password
│   │   │   ├── RegisterPage.tsx        # Dedicated register page with password strength meter
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── RecordsPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/api.ts        # REST API client with credentials & CSRF headers
│   │   ├── index.css              # Modern ESG design system tokens
│   │   ├── App.tsx                # Protected routes & session routing
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml             # Orchestrates postgres, redis, backend, and frontend
├── .env.example
└── README.md
```

---

## 🧮 Transparent ESG Scoring Methodology

SustainIQ computes all sustainability scores through verifiable mathematical formulations without black-box estimations:

### 1. Environmental Score (0 – 100) — Weight: 40%
* **Renewable Energy (30%)**: Clean energy share $[0, 100]\%$.
* **Recycling Rate (30%)**: $\min\left(100, \frac{\text{Waste Recycled}}{\text{Waste Generated}} \times 100\right)$.
* **Carbon Efficiency (20%)**: Evaluates $\text{CO}_2\text{e}$ emissions per employee against industrial benchmarks.
* **Energy Efficiency (20%)**: Evaluates $\text{kWh}$ consumption per employee.

$$\text{Env Score} = (0.30 \times \text{Renewable}) + (0.30 \times \text{Recycling}) + (0.20 \times \text{Carbon Factor}) + (0.20 \times \text{Energy Factor})$$

### 2. Social Score (0 – 100) — Weight: 30%
* **Employee Training (40%)**: Hours of training per employee measured against a 3.5 hrs/month target.
* **Workplace Safety (40%)**: 100-point baseline with a 20-point deduction per recorded workplace safety incident.
* **Community Initiatives (20%)**: Sustainability and outreach projects (5+ initiatives = 100%).

$$\text{Soc Score} = (0.40 \times \text{Training Factor}) + (0.40 \times \text{Safety Factor}) + (0.20 \times \text{Community Factor})$$

### 3. Governance Score (0 – 100) — Weight: 30%
* **Statutory Compliance (50%)**: Direct compliance rate $[0, 100]\%$.
* **Ethics Record (25%)**: 100-point baseline with a 25-point deduction per ethics or whistleblower incident.
* **Internal Governance Audit (25%)**: Score on board diversity, data privacy, and transparency.

$$\text{Gov Score} = (0.50 \times \text{Compliance}) + (0.25 \times \text{Ethics Factor}) + (0.25 \times \text{Audit Factor})$$

### 4. Unified Overall ESG Score (0 – 100)
$$\text{Overall ESG Score} = (\text{Env Score} \times 0.40) + (\text{Soc Score} \times 0.30) + (\text{Gov Score} \times 0.30)$$

*If telemetry is missing or unrecorded, the platform clearly displays: **"Insufficient data to calculate ESG score."***

---

## ⚡ Redis Caching & Invalidation Architecture

1. **User-Scoped Keying**: Cache keys explicitly incorporate both the authenticated user ID and organization ID:
   ```
   dashboard:user:{userId}:org:{organizationId}
   ```
   This strictly guarantees that cached data for one user is never leaked to another user.
2. **Cache HIT / MISS**: Cached dashboard telemetry returns with `cacheStatus: "HIT"`. If missing, PostgreSQL calculates live statistics and caches the result for 3600 seconds (`cacheStatus: "MISS"`).
3. **Instant Invalidation**: Whenever an organization or ESG record is created, edited, or deleted, `invalidateOrgCache(orgId, userId)` clears the respective cache keys immediately.

---

## 🔐 Authentication & Security

* **Separate Login and Registration Pages**: Fully responsive interfaces designed with the SustainIQ emerald visual theme.
* **Registration Page**: Full name, email format validation, password strength meter (Weak/Moderate/Strong), and matching password validation.
* **Login Page**: Work email, password with show/hide control, clear invalid-credentials messaging.
* **Session Management**: Secure HTTP-only SameSite cookies prevent XSS credential theft. JWT token authorization works with both cookies and `Authorization: Bearer <token>` headers.
* **CSRF Protection**: Double-submit cookie verification and anti-CSRF request header validation on state-changing requests (`POST`, `PUT`, `DELETE`).
* **Rate Limiting**: Brute-force protection on `/api/auth/login` and `/api/auth/register` via `express-rate-limit`.
* **Logout**: Clears authentication cookies and redirects the user immediately to the Login page.

---

## 📦 PostgreSQL Configuration

### Local Development / Standalone
SustainIQ is configured to connect to PostgreSQL via `DATABASE_URL`:
```bash
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/sustainiq
```
If PostgreSQL is not running as a local Windows service or Docker container, the backend will automatically spin up its embedded PostgreSQL engine on port 5432 with persistent disk storage in `backend/data/db`. No manual DB installation is required for local testing.

### Docker Compose
When running via Docker Compose, PostgreSQL 16 runs in a dedicated container:
```bash
DATABASE_URL=postgresql://postgres:postgrespassword@postgres:5432/sustainiq
```

---

## 🚀 How to Run the Application

### Option A: Local Development

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

3. Open your browser at [http://localhost:5173](http://localhost:5173).

### Option B: Using Docker Compose

```bash
docker-compose up --build
```
* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Running the Verification Test Suite

To run the comprehensive 23-step integration test verifying PostgreSQL connection, user registration, bcrypt password hashing, login, JWT verification, organization ownership data isolation between User A and User B, scoring, Redis caching, and dynamic PDF generation:

```bash
cd backend
npx ts-node src/scripts/verifyIntegration.ts
```

---

## 📡 REST API Reference

### Authentication Endpoints (Public & Protected)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new account (name, email, password) | No (Rate Limited) |
| `POST` | `/api/auth/login` | Authenticate user & set secure HTTP-only cookie | No (Rate Limited) |
| `POST` | `/api/auth/logout` | Clear authentication session cookie | Yes |
| `GET` | `/api/auth/me` | Retrieve currently authenticated user profile | Yes |

### Organizations & Dashboard Endpoints (Protected)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health, PostgreSQL status, Redis telemetry | No |
| `GET` | `/api/organizations` | Retrieve authenticated user's organizations | Yes |
| `POST` | `/api/organizations` | Create an organization profile (sets `owner_id`) | Yes |
| `GET` | `/api/organizations/:id` | Get organization details (verifies ownership) | Yes |
| `PUT` | `/api/organizations/:id` | Update organization details (invalidates cache) | Yes |
| `DELETE` | `/api/organizations/:id` | Delete organization & cascade delete records | Yes |
| `GET` | `/api/organizations/:id/dashboard` | Get KPIs & charts (Redis cached by user & org) | Yes |
| `GET` | `/api/organizations/:id/reports/pdf` | Stream dynamic vector PDF ESG report | Yes |

### ESG Records Endpoints (Protected)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/organizations/:orgId/esg` | Retrieve records for an owned organization | Yes |
| `POST` | `/api/organizations/:orgId/esg` | Add record (calculates scores & invalidates cache) | Yes |
| `GET` | `/api/esg/:id` | Get single ESG record (verifies ownership) | Yes |
| `PUT` | `/api/esg/:id` | Update ESG record (recalculates scores & cache) | Yes |
| `DELETE` | `/api/esg/:id` | Delete ESG record (invalidates cache) | Yes |

---

## 📜 License

Academic Project — Developed for educational demonstration and sustainability analytics evaluation.
