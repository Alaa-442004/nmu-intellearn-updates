# NMU IntelliLearn — Deployment Instructions

This guide covers local development setup and production deployment for all three runtime components:

1. **Next.js frontend** (port 3000)
2. **PHP API** (`nmu-api/`)
3. **Python proctor service** (port 5001, optional for exams)

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Comes with Node |
| PHP | 8.0+ | Extensions: `pdo_mysql`, `json` |
| MySQL / MariaDB | 5.7+ / 10+ | Database for courses & certificates |
| Python | 3.9+ | Only if using camera proctoring |
| Web server | Apache/Nginx or PHP built-in | For PHP API |

---

## 1. Local development

### 1.1 Clone and install frontend

```bash
cd NMU_Intellilearn-Main
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost/nmu-api
NEXT_PUBLIC_PROCTOR_BASE_URL=http://127.0.0.1:5001
```

> If using PHP built-in server on port 8080, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`

### 1.2 Start Next.js

```bash
npm run dev
```

Application: [http://localhost:3000](http://localhost:3000)

### 1.3 Database setup

1. Create MySQL database (default name in code: `pro-gr`):

```sql
CREATE DATABASE `pro-gr` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import or create tables expected by PHP:

- `courses` — with `is_published`, `course_id`, `title`, `description`, `long_description`, `duration`, `rating`, `total_student`, `instructor_id`, `created_at`
- `course_modules` — `module_id`, `course_id`, `title`, `duration`, `order_index`
- `users` — `user_id`, `first_name`, `last_name` (for instructor names)
- `certificates` — `certificate_id`, `certificate_number`, `issued_at`, `expires_at`, `is_verified`, `course_id`, `user_id`

> The repository does not include SQL migration files; schema must match queries in `nmu-api/courses.php` and `nmu-api/certificates.php`.

### 1.4 Deploy PHP API locally

**Option A — XAMPP/WAMP (Windows)**

1. Copy the `nmu-api` folder to `htdocs/nmu-api` (or your web root).
2. Ensure Apache and MySQL are running.
3. Set environment variables in Apache vhost or system env:

```env
DB_HOST=127.0.0.1
DB_NAME=pro-gr
DB_USER=root
DB_PASS=
DB_CHARSET=utf8mb4
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

4. Test: [http://localhost/nmu-api/courses.php](http://localhost/nmu-api/courses.php)

**Option B — PHP built-in server**

```bash
cd nmu-api
set DB_HOST=127.0.0.1
set DB_NAME=pro-gr
set DB_USER=root
set DB_PASS=
set ALLOWED_ORIGINS=http://localhost:3000
php -S localhost:8080
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

**Chat storage:** On first chat request, `chat-storage.json` is created in `nmu-api/`. Ensure the web server user can write to that directory.

### 1.5 Start proctor service (optional)

```bash
pip install -r proctor_server_requirements.txt
python proctor_server.py
```

Verify: [http://127.0.0.1:5001/status](http://127.0.0.1:5001/status)

**Requirements:**

- Webcam available
- Haar cascade file at:
  `Real-time-Face-Recognition-Project-main/haarcascade_frontalface_alt.xml`

**Exam flow without proctor:** The exam page still runs; camera polling fails silently if the service is down. Anti-cheat browser rules still apply.

---

## 2. Production build (frontend)

### 2.1 Environment

Create `.env.production` or set CI/CD variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/nmu-api
NEXT_PUBLIC_PROCTOR_BASE_URL=https://proctor.yourdomain.com
```

> `NEXT_PUBLIC_*` variables are embedded at **build time**. Rebuild after changing them.

### 2.2 Build and run

```bash
npm run build
npm run start
```

Default port: **3000** (set `PORT` env to override).

### 2.3 Deploy targets

| Platform | Notes |
|----------|-------|
| **Vercel** | Native Next.js support; set env vars in dashboard; PHP API must be hosted elsewhere |
| **VPS (Node + PM2)** | `npm run build && pm2 start npm --name intellilearn -- start` |
| **Docker** | Multi-stage build: `node:18-alpine`, copy `.next` and `node_modules` |

Example minimal Dockerfile (frontend only):

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_PROCTOR_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_PROCTOR_BASE_URL=$NEXT_PUBLIC_PROCTOR_BASE_URL
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 3. Production PHP API

### 3.1 Apache example

```apache
<VirtualHost *:443>
    ServerName api.yourdomain.com
    DocumentRoot /var/www/nmu-api

    <Directory /var/www/nmu-api>
        AllowOverride All
        Require all granted
    </Directory>

    SetEnv DB_HOST 127.0.0.1
    SetEnv DB_NAME pro-gr
    SetEnv DB_USER intellilearn_user
    SetEnv DB_PASS secure_password_here
    SetEnv ALLOWED_ORIGINS https://yourdomain.com

    SSLEngine on
    # SSLCertificateFile /path/to/cert.pem
    # SSLCertificateKeyFile /path/to/key.pem
</VirtualHost>
```

### 3.2 Nginx + PHP-FPM example

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    root /var/www/nmu-api;
    index index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Set PHP-FPM pool environment variables for `DB_*` and `ALLOWED_ORIGINS`.

### 3.3 Security checklist

- [ ] Use dedicated DB user with least privilege
- [ ] Never commit `.env` with real passwords
- [ ] Restrict `ALLOWED_ORIGINS` to production frontend URL only
- [ ] Enable HTTPS on API and frontend
- [ ] Disable directory listing on `nmu-api/`
- [ ] Restrict write permissions on `chat-storage.json` directory
- [ ] Regular MySQL backups

---

## 4. Production proctor service

### 4.1 Systemd service (Linux VPS)

`/etc/systemd/system/intellilearn-proctor.service`:

```ini
[Unit]
Description=NMU IntelliLearn Proctor Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/intellilearn
Environment=PATH=/var/www/intellilearn/venv/bin
ExecStart=/var/www/intellilearn/venv/bin/python proctor_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

> **Note:** Default `proctor_server.py` binds `127.0.0.1:5001`. For remote access, put **nginx reverse proxy** in front; do not expose OpenCV service directly to the public internet without authentication.

### 4.2 Nginx reverse proxy

```nginx
location /proctor/ {
    proxy_pass http://127.0.0.1:5001/;
    proxy_set_header Host $host;
}
```

Set `NEXT_PUBLIC_PROCTOR_BASE_URL=https://yourdomain.com/proctor`.

### 4.3 Windows service

Use NSSM or Task Scheduler to run:

```powershell
cd C:\path\to\NMU_Intellilearn-Main
.\venv\Scripts\python.exe proctor_server.py
```

---

## 5. Full stack deployment diagram

```
                    ┌─────────────────────┐
                    │   CDN / Vercel      │
                    │   Next.js (HTTPS)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │ PHP API (HTTPS) │ │   MySQL     │ │ Proctor (internal)│
    │  nmu-api/       │ │  pro-gr     │ │  Flask :5001     │
    └─────────────────┘ └─────────────┘ └─────────────────┘
```

---

## 6. Verification checklist

After deployment, verify:

| Check | URL / action | Expected |
|-------|----------------|----------|
| Home loads | `/` | 200, navbar visible |
| Courses API | `courses.php` | `{ "success": true, "courses": [...] }` |
| CORS | Browser devtools on `/courses` | No CORS errors |
| Certificates | `/certificates` | List or empty array |
| Chat | `/meeting` | Rooms load, message sends |
| Proctor | `GET /status` | JSON with `running`, `suspicious` |
| Exam | Full flow from `/my-exam` | Permissions → exam → results |
| Theme | Toggle dark mode | Persists on refresh |
| Build | `npm run build` | No TypeScript errors |

---

## 7. Troubleshooting

### CORS errors

- Confirm frontend origin is listed in `ALLOWED_ORIGINS`
- Check browser sends `Origin` header
- Verify `db.php` runs before any output

### Database connection failed

- Test credentials: `mysql -u user -p pro-gr`
- Confirm PHP `pdo_mysql` extension: `php -m | findstr pdo_mysql`

### Courses page empty / error

- Ensure `courses.is_published = 1` for rows
- Check PHP error log

### Proctor not starting

- Camera not in use by another app
- Install OpenCV: `pip install opencv-python`
- Verify Haar XML path exists

### Images broken on My Exams

- Add missing PNG files to `public/` root (hashes referenced in `my-exam/page.tsx`)

### `npm run build` fails

- Run `npm run lint`
- Ensure Node 18+

---

## 8. Environment variable reference

### Next.js (build-time public)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost/nmu-api` | PHP API base URL |
| `NEXT_PUBLIC_PROCTOR_BASE_URL` | `http://127.0.0.1:5001` | Proctor service base URL |

### PHP (`getenv` in `db.php`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_NAME` | `pro-gr` | Database name |
| `DB_USER` | `root` | MySQL user |
| `DB_PASS` | `` | MySQL password |
| `DB_CHARSET` | `utf8mb4` | Connection charset |
| `ALLOWED_ORIGINS` | `http://localhost:3000,...` | CORS allowed origins |

---

## 9. Maintenance

- **Logs:** Apache/Nginx access + error logs; PM2 logs for Node; systemd journal for proctor
- **Updates:** `npm audit`, periodic dependency upgrades for Next.js security patches
- **Backups:** MySQL daily; `chat-storage.json` if chat history matters
- **Monitoring:** Health check endpoints — `courses.php`, proctor `/status`

---

For architecture and feature details, see [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md).
