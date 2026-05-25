# NMU IntelliLearn

**Advanced AI-Powered Learning, Examination & Digital Certification System**

NMU IntelliLearn is a full-stack e-learning platform built for Northern Mediterranean University (NMU). It combines course delivery, live collaboration, AI-assisted proctored examinations, and digital certificates in a single web experience.

---

## Quick links

| Document | Description |
|----------|-------------|
| [LMS Product & UX Design (Final)](docs/LMS_PRODUCT_DESIGN.md) | Product strategy, sitemap, flows, MVP phases, design system — **authoritative spec** |
| [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md) | Architecture, pages, APIs, state, UI, and implementation details |
| [Progress Report](docs/PROGRESS_REPORT.md) | Completed vs. pending work and recommended next steps |
| [Deployment Guide](docs/DEPLOYMENT.md) | Local setup, production deployment, and environment configuration |

---

## Features at a glance

- **Course catalog** — Browse and view course details from a PHP/MySQL API
- **Proctored exams** — Timer, MCQ/essay questions, anti-cheat, and camera-based proctoring (Python/Flask)
- **Digital certificates** — List and view certificates from the database
- **Live meetings** — Real-time chat rooms via PHP + JSON file storage
- **Role-based dashboards** — Student, instructor, and admin UIs (demo auth)
- **Dark/light theme** — Persisted with Zustand
- **FAQ chatbot** — Keyword-based assistant on most pages

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 3.4, Framer Motion |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| State | Zustand (theme), React `useState` / `useEffect`, browser storage |
| Backend API | PHP 8+ (PDO/MySQL) in `nmu-api/` |
| Proctoring | Python Flask + OpenCV (`proctor_server.py`) |

---

## Prerequisites

- **Node.js** 18+ and npm
- **PHP** 8+ with PDO MySQL extension (e.g. XAMPP, WAMP, or built-in server)
- **MySQL** database named `pro-gr` (or configure via env)
- **Python** 3.9+ (optional, for exam proctoring)

---

## Quick start (local)

### 1. Frontend

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. PHP API

Copy `nmu-api/` to your web server document root (e.g. `htdocs/nmu-api`) or serve it with PHP:

```bash
cd nmu-api
php -S localhost:8080
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to match (e.g. `http://localhost:8080`).

### 3. Proctor service (optional)

```bash
pip install -r proctor_server_requirements.txt
python proctor_server.py
```

Runs on `http://127.0.0.1:5001` by default.

---

## Demo login credentials

| Role | Email | Password | Redirect |
|------|-------|----------|----------|
| Admin | `admin@knowledgejudge.com` | `Admin123!` | `/admin/dashboard` |
| Student | `gana@example.com` | `Student123!` | `/dashboard` |
| Instructor | `prof.aya@example.com` | `Instructor123!` | `/instructor/dashboard` |

> Auth uses demo credentials + HTTP-only cookies (`middleware.ts` protects role routes). Approved instructors can sign in after admin approval.

---

## Exam flow

```
/my-exam → /exam-proctoring → /quiz-login → /exam/[id] → /exam/results/[id]
```

Optional: `/review-result`, `/certificates/[id]`

---

## Project structure

```
NMU_Intellilearn-Main/
├── app/                    # Next.js App Router pages
├── components/             # UI, navigation, chatbot
├── lib/                    # API client, config, stores, exam logic
├── nmu-api/                # PHP REST endpoints (MySQL + chat JSON)
├── public/images/          # Static illustrations and patterns
├── proctor_server.py       # Flask camera proctor microservice
├── docs/                   # Technical docs, progress, deployment
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint (Next.js config) |

---

## Environment variables

See `.env.local.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost/nmu-api
NEXT_PUBLIC_PROCTOR_BASE_URL=http://127.0.0.1:5001
```

PHP database settings are configured in `nmu-api/db.php` via `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, and `ALLOWED_ORIGINS`.

---

## License

Private project (`"private": true` in `package.json`). Contact the institution for usage terms.

---

For full system design, page-by-page behavior, API contracts, and remaining work, see [docs/TECHNICAL_DOCUMENTATION.md](docs/TECHNICAL_DOCUMENTATION.md).
