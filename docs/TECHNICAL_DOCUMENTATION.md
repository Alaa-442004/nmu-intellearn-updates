# NMU IntelliLearn — Technical Documentation

**Version:** 1.0.0  
**Last updated:** May 2026  
**Codebase:** `nmu-intellilearn` (Next.js 14 App Router)

---

> **Product source of truth:** [LMS_PRODUCT_DESIGN.md](./LMS_PRODUCT_DESIGN.md) — final sitemap, instructor flow (platform-contained only), MVP phases, and design tokens. This technical doc describes the **current implementation**; where they differ, the product design doc defines the target.

## Table of contents

1. [Project overview](#1-project-overview)
2. [Tech stack](#2-tech-stack)
3. [Folder structure](#3-folder-structure)
4. [Implemented features](#4-implemented-features)
5. [Pages and screens](#5-pages-and-screens)
6. [Authentication flow](#6-authentication-flow)
7. [API integration](#7-api-integration)
8. [State management](#8-state-management)
9. [UI/UX details](#9-uiux-details)
10. [Remaining tasks](#10-remaining-tasks)
11. [Challenges solved](#11-challenges-solved)
12. [Related documents](#12-related-documents)

---

## 1. Project overview

### What is the project?

**NMU IntelliLearn** is an integrated learning management and assessment platform. It provides:

- Online course discovery and module-based learning paths
- Secure, proctored online examinations with integrity monitoring
- Digital certificate issuance and verification
- Real-time meeting/chat for course collaboration
- Separate experiences for **students**, **instructors**, and **administrators**

The frontend is a **Next.js 14** single-page application. Business data for courses and certificates is served by a **PHP + MySQL** API (`nmu-api/`). Exam camera monitoring uses a separate **Python Flask** service (`proctor_server.py`).

### Purpose

To give NMU students and staff a unified digital environment for:

1. Enrolling in and progressing through courses
2. Taking timed, monitored exams with academic integrity controls
3. Receiving verifiable digital credentials
4. Communicating in course-specific chat rooms

### Target users

| User type | Primary goals |
|-----------|----------------|
| **Students** | Browse courses, take exams, view results and certificates, join meetings |
| **Instructors** | Manage courses, view student progress, communicate with learners |
| **Administrators** | Oversee platform analytics, courses, exams, students, and payments |
| **Exam proctors / system** | Automated camera and browser integrity checks during assessments |

### Main goals

1. **Accessible learning** — Responsive UI, dark mode, clear navigation
2. **Exam integrity** — Tab-switch detection, clipboard blocking, DevTools heuristics, mouse-movement analysis, optional camera proctoring
3. **Backend integration** — Real course and certificate data from MySQL where configured
4. **Prototype completeness** — Full UI flows for all roles while backend auth and exam persistence remain incremental

---

## 2. Tech stack

### Frameworks

| Technology | Version | Role |
|------------|---------|------|
| **Next.js** | 14.2.x | App Router, SSR/SSG, routing, `next/image`, metadata |
| **React** | 18.3.x | UI components, hooks |
| **Flask** | 3.0+ | Proctor microservice HTTP API |

### Libraries

| Library | Purpose |
|---------|---------|
| **TypeScript** | Static typing across the frontend |
| **Tailwind CSS** | Utility-first styling, dark mode (`class` strategy) |
| **Framer Motion** | Page transitions, navbar indicator, hero animations |
| **Zustand** | Global theme state |
| **React Hook Form** | Form state for login, register, forgot password |
| **Zod** | Schema validation (forms + API response parsing) |
| **@hookform/resolvers** | Zod integration with React Hook Form |
| **Recharts** | Bar, line, and pie charts on dashboards |
| **lucide-react** | Icon set |
| **clsx** + **tailwind-merge** | Conditional class names (`cn()` helper) |
| **OpenCV (cv2)** | Face detection in proctor service |
| **numpy** | Image processing support for proctor |

### Languages

- **TypeScript / TSX** — Frontend application code
- **JavaScript** — `next.config.js`, PostCSS config
- **PHP** — REST API in `nmu-api/`
- **Python** — Proctor server
- **SQL** — MySQL schema (expected by PHP queries; not shipped as migration files in repo)

### Tools

| Tool | Usage |
|------|--------|
| **npm** | Package management |
| **ESLint** (`eslint-config-next`) | Linting |
| **PostCSS + Autoprefixer** | CSS pipeline for Tailwind |
| **next/font (Inter)** | Optimized Google font loading |
| **PDO (PHP)** | Database access |
| **JSON file** (`chat-storage.json`) | Chat message persistence |

---

## 3. Folder structure

### Root layout

```
NMU_Intellilearn-Main/
├── app/                          # Next.js App Router — all routes
├── components/                   # Shared React components
├── lib/                          # Business logic, API, config, stores
├── nmu-api/                      # PHP backend
├── public/                       # Static assets
├── docs/                         # Project documentation
├── Real-time-Face-Recognition-Project-main/  # Haar cascade for proctor
├── proctor_server.py             # Flask proctor API
├── proctor_server_requirements.txt
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json                 # Path alias: @/* → project root
├── postcss.config.js
├── .env.local.example
└── .eslintrc.json
```

> **Note:** A nested duplicate folder `NMU_Intellilearn-Main/NMU_Intellilearn-Main/` may exist from copying the project; use the root-level project as canonical.

### `app/` — Routes and layouts

| Path | Description |
|------|-------------|
| `layout.tsx` | Root layout: Inter font, `ThemeProvider`, `ConditionalChatbot`, metadata |
| `globals.css` | Tailwind directives, CSS variables for light/dark |
| `page.tsx` | Landing / marketing home |
| `login/`, `register/`, `forgot-password/` | Auth UI pages |
| `dashboard/`, `profile/` | Student views |
| `courses/`, `courses/[id]/` | Catalog and detail |
| `certificates/`, `certificates/[id]/` | Certificate list and detail |
| `my-exam/` | Exam hub (static lists) |
| `exam-proctoring/` | Pre-exam permissions and rules |
| `quiz-login/` | Lightweight exam entry |
| `exam/[id]/` | Live proctored exam |
| `exam/results/[id]/` | Post-submit results |
| `review-result/` | Alternate results view (`?examId=`) |
| `meeting/` | Live chat rooms |
| `video/` | Video library browser |
| `instructor/Dashboard/` | Instructor portal |
| `admin/*` | Admin portal (8 pages) |

There is **no** `app/api/` directory — no Next.js Route Handlers.

### `components/`

| Path | Description |
|------|-------------|
| `navigation/navbar.tsx` | Sticky header, desktop/mobile nav, active route indicator |
| `providers/theme-provider.tsx` | Calls `initTheme()` on mount |
| `ui/button.tsx` | Reusable button variants |
| `ui/card.tsx` | Card container |
| `ui/input.tsx` | Styled input |
| `ui/theme-toggle.tsx` | Light/dark toggle |
| `chat/ChatbotWidget.tsx` | Floating FAQ bot |
| `chat/ConditionalChatbot.tsx` | Hides bot on exam/meeting routes |

### `lib/`

| Path | Description |
|------|-------------|
| `api/client.ts` | `fetchJson<T>()`, `ApiError` class |
| `api/contracts.ts` | Zod schemas for courses and certificates API |
| `config/api.ts` | `apiUrl()` — builds PHP API URLs |
| `config/proctor.ts` | `proctorUrl()` — builds proctor service URLs |
| `store/theme-store.ts` | Zustand theme store |
| `utils/cn.ts` | `clsx` + `tailwind-merge` helper |
| `demo-exam.ts` | Static JavaScript fundamentals exam |
| `exam-result-storage.ts` | Grading, `sessionStorage` persistence, letter grades |

### `nmu-api/` — PHP backend

| File | Description |
|------|-------------|
| `db.php` | PDO connection, CORS, `json_response()`, `read_json_input()` |
| `courses.php` | List courses or single course with modules |
| `certificates.php` | List certificates (optional `user_id` filter) |
| `chat.php` | Rooms, messages, send, create room |
| `chat-storage.json` | Created at runtime for chat persistence |

### `public/`

| Path | Description |
|------|-------------|
| `images/undraw_*.png` | Hero and section illustrations |
| `images/*.png` | Background patterns (fabric, scales, etc.) |

Some pages reference exam thumbnails at root paths (e.g. `/ecc1535ba158700e2dc112c58ead9531f6b487db.png`) that are **not** present in `public/` — those images will 404 until added.

### Configuration files

| File | Role |
|------|------|
| `next.config.js` | `reactStrictMode: true` |
| `tailwind.config.ts` | Brand colors, animations, content paths |
| `tsconfig.json` | Strict mode, `@/*` paths |
| `.env.local.example` | Frontend public env template |

---

## 4. Implemented features

### 4.1 Landing and navigation

- Marketing hero with CTAs to login and courses
- Feature highlights (learning, certification, community)
- Global navbar on most pages with responsive mobile menu
- Animated active link indicator (Framer Motion `layoutId`)

### 4.2 Theme system

- Light/dark mode via `class` on `<html>`
- Persisted in `localStorage` key `theme`
- Zustand store with `initTheme`, `setTheme`, `toggleTheme`
- Smooth color transitions on `body`

### 4.3 Course catalog (live API)

- Fetches published courses from `courses.php`
- Zod-validated response parsing
- Loading and error states
- Course cards with level, duration, rating, student count
- Course detail page with modules and instructor name

### 4.4 Certificates (live API)

- Lists certificates from `certificates.php`
- Optional filtering by `user_id` query param
- Certificate detail can merge `sessionStorage` exam results for score display

### 4.5 Meeting / live chat (live API)

- Lists chat rooms (`action=rooms`)
- Polls new messages every ~2 seconds
- Send messages via POST
- Create new rooms dynamically
- File-based storage in `chat-storage.json` (default rooms: General, CS 101, Math 201)

### 4.6 Exam ecosystem (demo data + rich client logic)

**Pre-exam (`/exam-proctoring`):**

- Requests microphone, camera, and screen-share permissions
- Releases camera stream immediately so Python proctor can open the device
- Rules checklist and agreement checkbox
- Redirects to `/quiz-login` when all checks pass

**Exam login (`/quiz-login`):**

- Collects student name (password field present but not validated)
- Stores `intellilearn_student_name` in `localStorage`
- Redirects to `/exam/1`

**Live exam (`/exam/[id]`):**

- Demo question bank (JavaScript Fundamentals) for any exam ID
- 60-minute countdown timer
- MCQ and essay question types
- Question navigation sidebar with answered indicators
- Fullscreen toggle tracking
- **Anti-cheat:**
  - Tab/window visibility — forces exit to `/my-exam`
  - Right-click, copy, paste blocked
  - Forbidden keyboard shortcuts (Ctrl+C/V/X/T/W/U/I, F12, DevTools combos)
  - DevTools open heuristic (window dimension threshold)
  - Excessive mouse movement in 2.5s window locks exam
- **Camera proctor:** polls Flask `/status` every 1.5s after `POST /start-proctor`
- Auto-submit on timer expiry
- Client-side MCQ grading; essays marked `pending`
- Results saved to `sessionStorage`

**Results:**

- `/exam/results/[id]` — detailed breakdown
- `/review-result?examId=` — alternate entry
- Letter grade helper (A–F based on MCQ percent)

### 4.7 Student dashboard and profile

- Dashboard with static Recharts (progress, activity)
- Profile with mock user data and editable form (client-only, no save API)

### 4.8 Instructor dashboard

- Loads profile from in-memory `instructorsDatabase` keyed by `localStorage.currentInstructorEmail`
- Course list, student table, stats cards
- Demo instructor: `prof.aya@example.com`

### 4.9 Admin portal

Eight admin pages with consistent layout and mock data:

- Dashboard (stats + charts)
- Courses, exams, students, questions management UIs
- Analytics charts
- Payments (placeholder content)
- Admin profile settings

### 4.10 Video library

- Searchable grid of hardcoded educational videos
- Category filters and modal-style detail UI
- No streaming backend integration

### 4.11 FAQ chatbot

- Keyword-based replies (meeting, exam, certificate, support)
- Suggested question chips
- Hidden on `/meeting`, `/exam*`, `/quiz-login`

### 4.12 Form validation

- Login, register, forgot-password use React Hook Form + Zod
- Inline field errors and loading states

---

## 5. Pages and screens

### Public / marketing

#### `/` — Home

| Aspect | Detail |
|--------|--------|
| **Purpose** | Introduce the platform and drive sign-up |
| **Components** | `Navbar`, Framer Motion, `next/image`, Lucide icons |
| **Functionality** | Hero, feature grid, CTA links to `/login` and `/courses` |
| **User flow** | Visitor → reads value prop → Get Started or Browse Courses |

---

### Authentication

#### `/login`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Role-based demo sign-in |
| **Components** | `Navbar`, `react-hook-form`, Zod, motion card |
| **Functionality** | Validates email/password format; checks hardcoded credentials; sets `localStorage` for student/instructor |
| **User flow** | Enter credentials → redirect by role (admin/student/instructor) or show error |

#### `/register`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Account creation UI |
| **Components** | Same form stack as login |
| **Functionality** | Password match validation; `console.log` on submit — **no API** |
| **User flow** | Fill form → simulated delay → no persistence |

#### `/forgot-password`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Password reset request UI |
| **Components** | Email form with success state |
| **Functionality** | Simulated 900ms delay; shows success message — **no email/API** |
| **User flow** | Enter email → “Check your inbox” confirmation |

---

### Student area

#### `/dashboard`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Learning progress overview |
| **Components** | `Navbar`, Recharts (`LineChart`, `BarChart`), stat cards |
| **Functionality** | Static mock metrics and charts |
| **User flow** | View progress → navigate via navbar |

#### `/profile`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Student profile management |
| **Components** | `Navbar`, form fields, avatar placeholder |
| **Functionality** | Mock profile for `gana@example.com`; local edit state only |
| **User flow** | Login as student → view/edit profile (not persisted) |

#### `/courses`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Course catalog |
| **Components** | `Navbar`, `fetchJson`, Zod `CoursesResponseSchema` |
| **Functionality** | `GET courses.php`; grid of course cards linking to `/courses/[id]` |
| **User flow** | Browse → click course → detail page |

#### `/courses/[id]`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Single course with modules |
| **Components** | API fetch with `CourseDetailResponseSchema` |
| **Functionality** | `GET courses.php?id={id}`; module list, instructor, metadata |
| **User flow** | Review syllabus → (enrollment not implemented) |

#### `/certificates`

| Aspect | Detail |
|--------|--------|
| **Purpose** | List earned certificates |
| **Components** | `CertificatesResponseSchema`, certificate cards |
| **Functionality** | `GET certificates.php`; links to `/certificates/[id]` |
| **User flow** | View list → open certificate detail |

#### `/certificates/[id]`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Display single certificate |
| **Components** | Reads `getExamResult()` from session storage when available |
| **Functionality** | Merges exam score with certificate UI; fallback mock “John Doe” data |
| **User flow** | After exam → view credential; download button logs to console |

#### `/my-exam`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Exam hub and entry point for proctored flow |
| **Components** | Tabs, search, exam cards, Lucide icons |
| **Functionality** | Hardcoded upcoming/in-progress/completed exams; search filter; “Start Exam” → `/exam-proctoring` |
| **User flow** | Select exam → proctoring setup → quiz login → take exam |

#### `/video`

| Aspect | Detail |
|--------|--------|
| **Purpose** | On-demand video library |
| **Components** | `Input`, search, category chips, video grid |
| **Functionality** | Static video array; filter by title/category |
| **User flow** | Search/browse → view metadata (playback not wired) |

#### `/meeting`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Real-time course chat |
| **Components** | Room sidebar, message list, polling `useEffect` |
| **Functionality** | `chat.php` rooms/messages/send/create_room |
| **User flow** | Pick room → read/send messages → optionally create room |

---

### Exam flow

#### `/exam-proctoring`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Pre-flight checks before exam |
| **Components** | Permission buttons (mic/camera/screen), rules list |
| **Functionality** | `getUserMedia` / `getDisplayMedia`; enables Start when all granted + rules agreed |
| **User flow** | Grant permissions → agree → Continue → `/quiz-login` |

#### `/quiz-login`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Identify student for exam session |
| **Components** | Simple form |
| **Functionality** | Saves name to `localStorage`; ignores password validation |
| **User flow** | Enter name → `/exam/1` |

#### `/exam/[id]`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Timed proctored examination |
| **Components** | Timer, question nav, MCQ radios, essay textarea, proctor status |
| **Functionality** | Full anti-cheat + proctor integration (see §4.6); submit grades and navigates to results |
| **User flow** | Answer questions → submit or timeout → `/exam/results/[id]`; violations → lock or `/my-exam` |

#### `/exam/results/[id]`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Show graded results |
| **Components** | Score summary, per-question review |
| **Functionality** | Reads `getExamResult(id)` from `sessionStorage` |
| **User flow** | Review score → link to certificate or my-exam |

#### `/review-result`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Alternate results page |
| **Components** | `useSearchParams` for `examId` |
| **Functionality** | Same storage as results page |
| **User flow** | Deep link with query param |

---

### Instructor

#### `/instructor/Dashboard`

| Aspect | Detail |
|--------|--------|
| **Purpose** | Instructor course and student management |
| **Components** | Course cards, student table, dropdown menus |
| **Functionality** | Data from `instructorsDatabase` by email in `localStorage` |
| **User flow** | Login as instructor → manage courses/students (UI only) |

---

### Admin

| Route | Purpose |
|-------|---------|
| `/admin/dashboard` | Platform KPIs and charts (mock) |
| `/admin/courses` | Course CRUD UI (mock data) |
| `/admin/exams` | Exam listing (mock) |
| `/admin/students` | Student table (mock) |
| `/admin/questions` | Question bank UI (mock) |
| `/admin/analytics` | Analytics charts (mock) |
| `/admin/payments` | Placeholder (mislabeled quiz readiness text) |
| `/admin/profile` | Admin account settings (mock) |

**Typical admin flow:** Login as admin → `/admin/profile` or navigate admin sidebar → view/manage mock entities.

---

## 6. Authentication flow

### Architecture summary

```
┌─────────────┐     hardcoded creds      ┌──────────────────┐
│  /login     │ ───────────────────────► │ localStorage     │
│  (client)   │     + router.push        │ (email keys)     │
└─────────────┘                          └──────────────────┘
        │                                           │
        ▼                                           ▼
   No JWT / cookies                          No middleware
   No route guards                           All routes public
```

### Login (`/login`)

1. User submits email + password (Zod: valid email, min 6 chars).
2. Simulated 800ms delay.
3. Credential check against three fixed accounts (see README).
4. On success:
   - **Admin** → `/admin/profile`
   - **Student** → `localStorage.setItem("currentStudentEmail", email)` → `/profile`
   - **Instructor** → `localStorage.setItem("currentInstructorEmail", email)` → `/instructor/Dashboard`
5. On failure → inline error message.

### Register (`/register`)

1. Validates name, email, password, confirm password match.
2. Simulated 1s delay.
3. Logs payload to `console.log` — **no registration endpoint**.

### Forgot password (`/forgot-password`)

1. Validates email.
2. Simulated delay; sets `isSubmitted` to show success UI.
3. Comment in code: *“Temporary local flow until backend reset endpoint is added.”*

### Exam-specific login (`/quiz-login`)

Separate from main auth:

- Stores `intellilearn_student_name` in `localStorage`
- Does not validate password
- Used only for displaying student name on results/certificates

### What is NOT implemented

- JWT / session cookies / NextAuth
- `middleware.ts` route protection
- Password hashing, email verification
- Role-based access control on API
- Logout flow (no session to clear beyond manual storage)

---

## 7. API integration

### 7.1 Frontend HTTP client

```typescript
// lib/api/client.ts
fetchJson<T>(url, init?)  // Parses JSON, throws ApiError on failure
```

```typescript
// lib/config/api.ts
apiUrl("courses.php")  // → ${NEXT_PUBLIC_API_BASE_URL}/courses.php
```

### 7.2 PHP API (`nmu-api/`)

**Base URL:** `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost/nmu-api`)

**CORS:** Configured in `db.php` via `ALLOWED_ORIGINS` env (comma-separated).

#### `GET /courses.php`

| Response | Description |
|----------|-------------|
| `{ success, courses[] }` | All published courses |
| Fields: `id`, `title`, `description`, `duration`, `students`, `rating`, `level` |

#### `GET /courses.php?id={id}`

| Response | Description |
|----------|-------------|
| `{ success, course }` | Single course with `modules[]`, `instructor`, `longDescription` |
| 404 if not found or unpublished |

#### `GET /certificates.php`

| Query | Description |
|-------|-------------|
| `user_id` (optional) | Filter by user |

| Response | Description |
|----------|-------------|
| `{ success, certificates[] }` | `id`, `title`, `course`, `score`, `date`, `certificateNumber`, `holder`, `verified` |

#### `GET /chat.php?action=rooms`

Returns `{ success, rooms: [{ id, name }] }`.

#### `GET /chat.php?action=messages&room_id=&last_id=`

Returns messages with `id > last_id` for polling.

#### `POST /chat.php?action=send`

Body: `{ room_id, username, message }`  
Returns created message object.

#### `POST /chat.php?action=create_room`

Body: `{ name }`  
Creates slug ID from name; returns `{ success, room }`.

### 7.3 Python proctor API

**Base URL:** `NEXT_PUBLIC_PROCTOR_BASE_URL` (default `http://127.0.0.1:5001`)

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/start-proctor` | POST | `{ camera_index?: 0, no_face_threshold_frames?, multi_face_threshold_frames? }` | `{ success, status }` |
| `/stop-proctor` | POST | — | `{ success, status }` |
| `/status` | GET | — | `{ running, suspicious, risk_score, last_message, last_face_count }` |

**Detection logic:**

- OpenCV Haar cascade face detection on webcam frames
- Flags: no face for ~30 frames, multiple faces for ~10 frames
- Runs in background thread; CORS enabled for browser fetch

### 7.4 Data not from API

| Data | Source |
|------|--------|
| Exam questions | `lib/demo-exam.ts` |
| Exam results | `sessionStorage` (`intellilearn_exam_results`) |
| Dashboards / admin | In-component mock arrays |
| Instructor profiles | In-component `instructorsDatabase` |
| Video catalog | In-component static list |

---

## 8. State management

### Global state (Zustand)

**`lib/store/theme-store.ts`**

| State | Type | Actions |
|-------|------|---------|
| `theme` | `"light" \| "dark"` | `setTheme`, `toggleTheme`, `initTheme` |

Persistence: `localStorage.theme` + `document.documentElement.classList`.

### Local component state

Most pages use React `useState` and `useEffect` for:

- Form inputs and loading flags
- API fetch results (`courses`, `certificates`, `meeting` messages)
- Exam UI (current question, answers, timer, proctor flags)
- Mobile menu open/close

### Browser storage

| Key | Storage | Purpose |
|-----|---------|---------|
| `theme` | localStorage | Light/dark preference |
| `currentStudentEmail` | localStorage | Student login marker |
| `currentInstructorEmail` | localStorage | Instructor login marker |
| `intellilearn_student_name` | localStorage | Exam display name |
| `intellilearn_exam_results` | sessionStorage | Map of examId → graded result |

### Server state

- **No React Query / SWR** — manual `fetch` in `useEffect`
- **No Next.js Server Actions** for mutations
- PHP chat uses file write on each message (no WebSockets)

### URL state

- Dynamic routes: `[id]` for courses, exams, certificates
- `review-result` uses `?examId=` search param

---

## 9. UI/UX details

### Color palette (Tailwind)

| Token | Hex | Usage |
|-------|-----|--------|
| `primary` | `#6A0F1C` | Brand burgundy — buttons, links, accents |
| `primary-dark` | `#5A0E18` | Hover states |
| `primary-light` | `#7A1A2A` | Variants |
| `accent` | `#C9A24D` | Gold highlights |
| `secondary` | `#1E1E1E` | Dark surfaces |
| `success` | `#2ECC71` | Positive indicators |
| `error` | `#E74C3C` | Validation errors |
| `background-light` | `#F7F7F7` | Page background (light) |
| `background-dark` | `#121212` | Page background (dark) |
| `card-light` / `card-dark` | `#FFFFFF` / `#1E1E1E` | Cards, navbar |

CSS variables in `globals.css` mirror background/card/text for base layer.

### Typography

- **Inter** (Google Font) via `next/font` on `<body>`
- Headings: bold, scale from `text-3xl` to `text-6xl` on hero

### Responsive design

- Mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- Navbar collapses to hamburger below `md`
- Grid layouts: 1 col mobile → 2–3 cols desktop
- Chatbot width: `w-80 sm:w-96`
- Exam layout: sidebar + main content stacks on small screens

### Animations

| Source | Effect |
|--------|--------|
| Framer Motion | Page fade/slide (`opacity`, `y`, `x`), navbar underline spring |
| Tailwind `animate-fade-in` | 0.5s fade |
| Tailwind `animate-slide-up` / `slide-down` | Vertical entrance |
| `transition-colors duration-300` | Theme switch on body |
| Logo hover | 360° rotate on graduation cap |

### Reusable components

- **Button** — `default`, `ghost`, `outline`; sizes `sm`, `md`, `lg`
- **Card** — bordered rounded container
- **Input** — consistent focus ring (`focus:ring-primary`)
- **ThemeToggle** — icon swap Sun/Moon

### UX patterns

- Sticky navbar with backdrop blur
- Loading spinners / text on API pages
- Error banners when API unreachable
- Exam: fullscreen encouragement, warning banners on proctor lock
- Chatbot: suggested questions reduce empty-state friction

---

## 10. Remaining tasks

### High priority

1. **Real authentication API** — Register, login, JWT/session, logout, password reset
2. **Route protection** — Next.js `middleware.ts` for `/admin/*`, `/instructor/*`, exam routes
3. **Exam backend** — Store questions, attempts, scores in MySQL; replace `demo-exam.ts`
4. **Persist exam results** — Server-side grading and certificate generation
5. **Missing public assets** — Exam thumbnail images referenced in `my-exam/page.tsx`

### Medium priority

6. **Student dashboard API** — Real enrollment progress and activity
7. **Admin CRUD APIs** — Wire courses, exams, students, questions pages to PHP
8. **Video streaming** — Integrate CDN or LMS video provider
9. **Certificate PDF download** — Replace `console.log` stub
10. **WebSocket chat** — Replace polling for `/meeting`
11. **Payments page** — Implement or remove misleading placeholder

### Low priority / polish

12. **i18n** — Arabic/English support (NMU context)
13. **Accessibility audit** — ARIA labels, keyboard nav on exam page
14. **E2E tests** — Playwright for exam and auth flows
15. **Remove duplicate nested project folder** if accidental
16. **SEO** — Per-page metadata beyond root layout

### Recommended implementation order

```
Auth API → Middleware → Exam API → Results persistence → Admin APIs → WebSockets → Production deploy
```

---

## 11. Challenges solved

### Camera conflict between browser and Python proctor

**Problem:** Browser holding the camera stream blocks OpenCV `VideoCapture` in the proctor service.

**Solution:** On `/exam-proctoring`, request camera permission then **immediately stop all tracks** (`stream.getTracks().forEach(t => t.stop())`) so the Flask service can open the device on exam start.

### CORS for local development

**Problem:** Next.js on port 3000 calling PHP on another origin.

**Solution:** `apply_cors()` in `db.php` reads `ALLOWED_ORIGINS` and sets `Access-Control-Allow-Origin` for matching `HTTP_ORIGIN`, plus OPTIONS preflight handling.

### Type-safe API responses

**Problem:** PHP returns JSON that may not match frontend expectations.

**Solution:** Zod schemas in `lib/api/contracts.ts` parsed after `fetchJson`; explicit error handling with `ApiError`.

### Exam integrity without server round-trips

**Problem:** Need immediate response to cheating attempts during demo exams.

**Solution:** Client-side listeners for visibility, clipboard, keyboard, DevTools size, and mouse velocity; optional async proctor status polling; `lockExam` stops proctor and shows violation UI; tab switch uses `window.location.replace` for hard exit.

### Chat without database schema

**Problem:** Quick prototype for meeting feature without new MySQL tables.

**Solution:** JSON file storage (`chat-storage.json`) with incremental message IDs and default rooms — simple to deploy, adequate for demos.

### Theme flash on load

**Problem:** Light theme flash before dark mode applies.

**Solution:** `suppressHydrationWarning` on `<html>` and `initTheme()` in `ThemeProvider` on mount reading `localStorage`.

### Grading MCQs vs essays

**Problem:** Essays cannot be auto-graded in demo.

**Solution:** `gradeExamSubmission` scores only MCQs for `scorePercent`; essays get `status: "pending"` for manual review UI.

---

## 12. Related documents

- [README.md](../README.md) — Quick start and overview
- [PROGRESS_REPORT.md](./PROGRESS_REPORT.md) — Status matrix and milestones
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Environment setup and production deployment

---

*End of technical documentation.*
