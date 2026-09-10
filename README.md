# SustainIQ — Smart ESG Monitoring & Analytics Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

> **SustainIQ** is a genuine, full-stack Environmental, Social, and Governance (ESG) monitoring and analytics platform engineered specifically for college project demonstration and real-world multi-organization sustainability tracking.

---

## 🌟 Core Philosophy: Zero-Mock Data Policy

**SustainIQ contains ZERO fake data, ZERO seed data, ZERO hardcoded KPI numbers, and ZERO static ESG scores.**

* When first launched, the database starts **100% empty**.
* Dashboards initially display a clear empty state:
  > *"No ESG data available yet. Add your first ESG record to start monitoring your organization's sustainability performance."*
* Every KPI card, chart, ESG pillar score, table row, and PDF report is derived **dynamically and exclusively** from user-submitted operational records stored in PostgreSQL.

---

## 🏛️ Application Architecture

```
User Browser (React 18 + Vite + Recharts + TypeScript)
                    │
                    ▼  (REST API / JSON / PDF Stream)
Express.js Backend (Node.js + TypeScript)
   ├── Input Validation (Zod Schemas)
   ├── Scoring Engine (Mathematical ESG Formulas)
   ├── Vector PDF Generator (PDFKit Stream)
   ├── Redis Caching Layer (ioredis: 3600s TTL + Invalidation)
   └── Relational Storage (PostgreSQL Pool + Foreign Key Cascades)
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Modern CSS (Deep Slate / Emerald Glassmorphism), Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Zod Validation, Helmet, CORS, PDFKit |
| **Database** | PostgreSQL 16 (Relational tables, foreign keys, cascade deletes, chronological indexes) |
| **Caching** | Redis 7 (Dashboard time-series caching with automatic invalidation on CRUD operations) |
| **Deployment** | Docker, Docker Compose multi-container configuration |

---

## 📁 Project Structure

```
ESG DASHBOARD/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts        # PostgreSQL pool + auto migrations + embedded fallback
│   │   │   └── redis.ts           # Redis client + TTL caching + invalidation
│   │   ├── controllers/
│   │   │   ├── organizationController.ts
│   │   │   ├── esgRecordController.ts
│   │   │   ├── dashboardController.ts
│   │   │   └── reportController.ts
│   │   ├── middleware/
│   │   │   ├── validation.ts      # Zod validation schemas
│   │   │   └── errorHandler.ts    # Global error handler
│   │   ├── routes/
│   │   │   ├── organizationRoutes.ts
│   │   │   ├── esgRecordRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── scoringService.ts  # Transparent ESG score calculations
│   │   │   ├── dashboardService.ts# Aggregations, KPIs, trends
│   │   │   └── pdfService.ts      # Vector PDF report generator
│   │   ├── types/
│   │   └── server.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Navbar, Sidebar, Layout
│   │   │   ├── dashboard/         # KpiCard, ScoreOverview, EmptyState, ExplainerModal
│   │   │   ├── charts/            # DashboardCharts (6 Recharts)
│   │   │   ├── records/           # RecordFormModal, RecordTable
│   │   │   ├── organizations/     # OrgFormModal
│   │   │   └── common/            # DeleteConfirmModal
│   │   ├── context/               # OrganizationContext (multi-tenant state)
│   │   ├── pages/                 # LandingPage, DashboardPage, RecordsPage, ReportsPage, SettingsPage
│   │   ├── services/api.ts        # REST API Client
│   │   ├── index.css              # Modern ESG design system tokens
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml             # Orchestrates postgres, redis, backend, and frontend
├── .env.example
└── README.md
```

---

## 🧮 Transparent ESG Scoring Methodology

SustainIQ computes all sustainability scores through verifiable mathematical formulations without black-box estimations:

### 1. Environmental Score (0 – 100) — Weight: 40%
* **Renewable Energy (30%)**: Directly represents the clean energy share $[0, 100]\%$.
* **Recycling Rate (30%)**: $\min\left(100, \frac{\text{Waste Recycled}}{\text{Waste Generated}} \times 100\right)$.
* **Carbon Efficiency (20%)**: Evaluates $\text{CO}_2\text{e}$ emissions per employee against industrial monthly benchmarks.
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

To demonstrate enterprise high-performance caching:
1. **Query Request**: When the dashboard requests telemetry for an organization (`GET /api/organizations/:id/dashboard`), the backend inspects Redis at key `dashboard:org:{orgId}`.
2. **Cache HIT**: If present, the cached statistics and chart arrays are returned instantly (`cacheStatus: "HIT"`).
3. **Cache MISS**: If missing, PostgreSQL is queried, metrics are computed, cached in Redis for 3600 seconds, and returned (`cacheStatus: "MISS"`).
4. **Instant Invalidation**: Whenever an ESG record is **added**, **edited**, or **deleted** (or the organization profile is updated), the backend immediately invalidates the cache key `dashboard:org:{orgId}`. The very next request fetches live database data and recalculates scores.
5. **Live Diagnostics**: The top navbar and the System Diagnostics page display real-time cache hits, misses, and invalidations.

---

## 🚀 How to Run the Application

### Option A: Using Docker Compose (Recommended)

1. Ensure Docker Desktop is installed and running.
2. From the project root, launch all 4 services:
   ```bash
   docker-compose up --build
   ```
3. Open your browser:
   * **Frontend Application**: [http://localhost:5173](http://localhost:5173)
   * **Backend REST API**: [http://localhost:5000](http://localhost:5000)

### Option B: Local Development (`npm run dev`)

The backend includes a dual-mode engine: it automatically connects to PostgreSQL and Redis when available, and provides a zero-setup embedded fallback when running locally without active services.

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

---

## 🎓 Teacher Demonstration Walkthrough (Steps 1–17)

Follow this step-by-step procedure to demonstrate the platform to evaluators:

1. **Step 1 — Open SustainIQ**: Navigate to [http://localhost:5173](http://localhost:5173). Observe the modern landing page detailing the ESG pillars and architectural stack without fake statistics.
2. **Step 2 — Click Get Started**: Click the prominent **Get Started** button.
3. **Step 3 — Create Organization 1**:
   * Organization Name: `Apex Healthcare System`
   * Type: Select `Hospital` (or test selecting `Other` to showcase custom type input)
   * Location: `Boston, MA`
   * Reporting Year: `2026`
   * Click **Create Organization**.
4. **Step 4 — Verify Initial Empty State**:
   * The dashboard loads with: *"No ESG data available yet. Add your first ESG record to start monitoring your organization's sustainability performance."*
   * All 7 KPI cards display `—` / `No data`.
   * No hardcoded chart values appear.
5. **Step 5 — Click Add ESG Record**: Click **+ Add ESG Record**.
6. **Step 6 — Enter Month 1 Operational Data**:
   * Date: `2026-01-01`
   * Environmental: Energy: `48,000 kWh`, Water: `110,000 L`, Waste Gen: `7,500 kg`, Waste Recycled: `3,200 kg`, Carbon: `19,500 kg CO2e`, Renewable: `32%`
   * Social: Workforce: `350`, Training: `750 hrs`, Safety Incidents: `0`, Community Initiatives: `2`
   * Governance: Compliance: `98%`, Ethics Violations: `0`, Governance Score: `88`
7. **Step 7 — Save Record**: Click **Save ESG Record**.
8. **Step 8 — Observe Calculated Dashboard**:
   * All 7 KPI cards instantly populate with mathematical totals.
   * The Overall ESG Scorecard displays the computed score and sub-pillar breakdown.
   * Click **"How is this calculated?"** to show the evaluator the exact formulas.
9. **Step 9 — Observe Charts**:
   * The 6 charts now show the initial data point for Jan 2026.
10. **Step 10 — Add Month 2 Record**:
    * Click **+ Add ESG Record**.
    * Date: `2026-02-01`
    * Energy: `42,000 kWh` (consumption reduced)
    * Water: `95,000 L`
    * Waste Gen: `7,000 kg`, Waste Recycled: `3,800 kg` (recycling increased)
    * Carbon: `16,800 kg CO2e` (emissions decreased)
    * Renewable: `42%` (green energy increased)
    * Workforce: `360`, Training: `900 hrs`, Safety: `0`, Community: `3`
    * Compliance: `99%`, Ethics: `0`, Governance: `90`
    * Save record.
11. **Step 11 — Observe Dynamic Trend Updating**:
    * The 6 time-series charts immediately render multi-month trend curves.
    * KPI cards display Month-over-Month (MoM) reduction percentages (e.g. Energy $-12.5\%$ MoM).
12. **Step 12 — Edit an ESG Record**:
    * Click **Edit** on a record. Change Waste Recycled from `3,800` to `4,200 kg`.
    * Save and observe the recycling percentage and KPI cards update immediately.
13. **Step 13 — Demonstrate Redis Invalidation**:
    * Notice the Redis cache status pill in the top header displaying cache invalidation and subsequent hits.
14. **Step 14 — Generate Dynamic PDF Report**:
    * Navigate to **ESG Reports (PDF)**.
    * Select period: `All Recorded History` or `Monthly`.
    * Click **Generate & Download PDF Report**.
    * Open the generated PDF: show that it contains the official SustainIQ banner, organization details, calculated scores, audit table, and automated analytical summary based exclusively on entered numbers.
15. **Step 15 — Create Organization 2**:
    * Click the organization dropdown in the header and select **+ Create Organization**.
    * Name: `Horizon Financial Group`
    * Type: `Bank`
    * Location: `New York, NY`
    * Year: `2026`
    * Click **Create Organization**.
16. **Step 16 — Switch Organization**:
    * Switch between `Apex Healthcare System` and `Horizon Financial Group`.
17. **Step 17 — Verify Multi-Tenant Isolation**:
    * Notice that Horizon Financial Group has **zero records**, showing the empty state, while Apex Healthcare System retains its exact data and charts. Data is completely isolated per organization in PostgreSQL.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Diagnostic system health, PostgreSQL status, and Redis cache telemetry |
| `GET` | `/api/organizations` | Retrieve all registered organizations |
| `POST` | `/api/organizations` | Create an organization profile |
| `GET` | `/api/organizations/:id` | Get organization details by ID |
| `PUT` | `/api/organizations/:id` | Update organization details (invalidates cache) |
| `DELETE` | `/api/organizations/:id` | Delete organization (cascades records in PostgreSQL) |
| `GET` | `/api/organizations/:id/dashboard` | Get calculated KPIs, scorecards, and charts (Redis cached) |
| `GET` | `/api/organizations/:id/esg` | Retrieve all ESG records for an organization |
| `POST` | `/api/organizations/:id/esg` | Insert an ESG record (recalculates scores & invalidates Redis cache) |
| `GET` | `/api/esg/:id` | Get a specific ESG record |
| `PUT` | `/api/esg/:id` | Update an ESG record (recalculates scores & invalidates Redis cache) |
| `DELETE` | `/api/esg/:id` | Delete an ESG record (invalidates Redis cache) |
| `GET` | `/api/organizations/:id/reports/pdf` | Stream dynamically generated vector PDF ESG report |

---

## 📜 License

Academic Project — Developed for educational demonstration and sustainability analytics evaluation.
