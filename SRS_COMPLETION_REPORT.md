# JG University Placement Portal — SRS Completion Report

## Architecture
- Angular 22 frontend
- Django 5.2 REST-style API
- MySQL 8 database
- JWT authentication
- Four roles: Student, Company, Placement, Admin

## Implemented SRS workflows
### Student
- Registration + strong password validation
- Email OTP verification
- Profile + academic details
- Skills
- PDF resume upload, 5 MB limit, SHA-256 duplicate detection, parser and score
- Certificate metadata + PDF upload, 5 MB limit, SHA-256 duplicate detection
- Digital portfolio endpoint/page
- AI resume score, skill gap, readiness and job matching
- Eligibility-aware job/application workflow
- Application status, interviews, offers, notifications
- Mock aptitude test with automatic scoring
- Mock interview question/answer module with structured feedback
- Placement timeline/drives already available
- Achievement Wall
- Alumni profiles + mentorship requests
- OTP password reset
- Ticket system

### Company
- Registration/profile and verification state
- HR team model
- Job posting and eligibility fields
- Applicant list
- AI candidate ranking endpoint/page
- Shortlisting/interview/offer workflow
- Candidate feedback storage
- Hiring reports

### Placement Cell
- Student/company/job verification APIs
- Resume/certificate verification
- Placement drives
- Reports/analytics
- Department filters
- Bulk in-app notifications and optional SMTP email
- Job approval
- Ticket resolution

### Admin
- User/role/department management
- Audit logs + login history
- Security settings
- AI settings
- MySQL database health endpoint
- `mysqldump` backup endpoint
- Notifications

### AI
- Resume parsing
- Resume score
- Job matching
- Skill-gap analysis
- Placement readiness score
- Recommended learning/feedback hooks
- Duplicate resume hash
- Rule-based certificate duplicate/flag checks
- Duplicate student email/enrollment validation

## Security controls
- Strong password policy
- Password hashing with Django password hashers
- JWT expiry
- Role-based Angular guards
- Backend role checks for new sensitive APIs
- Automatic 30-minute frontend inactivity logout
- Login history
- Audit logs
- PDF/file-size validation
- ORM-based database access
- OTP expiry and attempt tracking

## Verification performed in this environment
- Python source compilation: PASS
- Backend module syntax compilation: PASS
- Archive/source integrity: PASS
- Angular full build: not executed here because the container could not complete the npm dependency installation; run `npm install` and `npm run build` on Windows before final submission.
- Live MySQL integration: requires the user's local MySQL service and credentials, so it cannot be truthfully marked as executed in this environment.

## Local setup
1. MySQL: create/use `jg_placement_portal`, user `root`, password `anjali@2`.
2. Backend:
   `cd backend`
   `py -m venv .venv`
   `.[.venv\Scripts\activate`
   `pip install -r requirements.txt`
   `python manage.py init_portal_db`
   `python manage.py runserver 8000`
3. Frontend:
   `npm install`
   `npm start`
4. Open `http://localhost:4200`.

## Demo accounts
- Student: `student@jg.edu` / `student123`
- Company: `company@jg.edu` / `company123`
- Placement: `placement@jg.edu` / `placement123`
- Admin: `admin@jg.edu` / `admin123`

Demo accounts are pre-verified. Newly registered student accounts must complete OTP verification before login.
