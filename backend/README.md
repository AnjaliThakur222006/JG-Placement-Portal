# JG University Placement Portal — Full Stack

This version connects the existing Angular UI to a real Django API and MySQL database and adds the rule-based/statistical AI features specified in the SRS.

## Architecture

- Angular 22 frontend
- Django 5.2 REST-style JSON API
- MySQL 8 database
- JWT authentication
- Password hashing
- 22 relational database tables
- PDF resume upload + SHA-256 duplicate detection
- Rule-based resume parsing and scoring
- Job matching and skill-gap analysis
- Placement readiness score
- Audit logs and login history

The SRS explicitly limits AI to rule-based and lightweight statistical models rather than an LLM, so this implementation follows that scope.

## MySQL

The local defaults are:

- database: `jg_placement_portal`
- user: `root`
- host: `127.0.0.1`
- port: `3306`

Set your local MySQL password with the `MYSQL_PASSWORD` environment variable before starting the backend. If MySQL is on another port, also set `MYSQL_PORT`. Never commit local database credentials.

## First-time backend setup (PowerShell)

```powershell
cd backend
.\setup.ps1
.\.venv\Scripts\python.exe manage.py runserver 8000
```

If PowerShell blocks the script:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\setup.ps1
```

Run these commands in a PowerShell terminal. Do not paste `.bat` syntax such as `@echo off` or `call venv\Scripts\activate.bat` into PowerShell. The setup script creates the virtual environment, installs dependencies, initializes MySQL tables, and idempotently seeds demo data.

## Frontend

Open a second terminal at the project root:

```powershell
npm install
npm start
```

Open:

`http://localhost:4200`

## Demo accounts

- Student: `student@jg.edu` / `student123`
- Company: `company@jg.edu` / `company123`
- Placement: `placement@jg.edu` / `placement123`
- Admin: `admin@jg.edu` / `admin123`

## API

Health:

`GET /api/health/`

Authentication:

- `POST /api/auth/login/`
- `POST /api/auth/register/`
- `POST /api/auth/logout/`

Portal state:

- `GET /api/state/`
- `PUT /api/state/`

AI:

- `GET /api/ai/skill-gap/`
- `GET /api/ai/readiness/`
- `GET /api/ai/job-match/<job_id>/`
- `POST /api/student/resume/upload/`
- `DELETE /api/student/resume/`

CRUD collection routes exist for users, students, companies, jobs, applications, interviews, offers, certificates, notifications, placementDrives, tickets, auditLogs and departments.

## Important

MySQL Server must be running before `init_portal_db` or the API is started. If XAMPP MySQL uses port 3307/3308 instead of 3306, change `MYSQL_PORT`.

Database credentials must be provided through environment variables and must not be committed to the repository.

## Production configuration

The frontend's Netlify build needs the deployed Django API URL in `src/environments/environment.prod.ts` (ending in `/api`). Set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and the `MYSQL_*` connection variables on the backend host. Add the exact Netlify site origin to `CORS_ALLOWED_ORIGINS`; do not use `*`. Run `manage.py init_portal_db` once against the production database to create tables and seed the sample placement and mock-test data.
