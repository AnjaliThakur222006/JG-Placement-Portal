import hashlib
import json
import re
import uuid
from datetime import date, time
from decimal import Decimal
from django.contrib.auth.hashers import check_password, make_password
from django.db import transaction
from .models import (
    UserAccount, Department, StudentProfile, AcademicRecord, Skill, StudentSkill, Resume, Certificate,
    Company, CompanyHR, Job, JobSkill, Application, Interview, Offer, Notification, PlacementDrive,
    Ticket, AuditLog, LoginHistory, AIAnalysis, SystemSetting, AlumniProfile, Achievement,
    MockTestQuestion,
)

DEMO_PASSWORDS = {
    "student@jg.edu": "student123",
    "company@jg.edu": "company123",
    "placement@jg.edu": "placement123",
    "admin@jg.edu": "admin123",
}

def sid():
    return str(uuid.uuid4())

def iso(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value

def safe_decimal(v):
    try:
        return float(v or 0)
    except (TypeError, ValueError):
        return 0

def user_json(u):
    return {
        "id": str(u.id), "email": u.email, "password": "",
        "role": u.role, "name": u.name, "isActive": u.is_active,
        "createdAt": iso(u.created_at),
    }

def student_json(s):
    academic = getattr(s, "academic", None)
    skills = [{"name": x.skill.name, "proficiency": x.proficiency} for x in s.student_skills.select_related("skill").all()]
    resume = getattr(s, "resume", None)
    certs = [{
        "id": str(c.id), "name": c.name, "issuingOrganization": c.issuing_organization,
        "date": iso(c.date), "credentialId": c.credential_id, "credentialLink": c.credential_link,
        "status": c.status,
    } for c in s.certificates.all()]
    result = {
        "id": str(s.id), "userId": str(s.user_id), "fullName": s.full_name, "email": s.email,
        "enrollmentNumber": s.enrollment_number, "department": s.department.name if s.department else "",
        "semester": s.semester, "mobile": s.mobile, "location": s.location, "about": s.about,
        "careerObjective": s.career_objective, "linkedIn": s.linked_in, "gitHub": s.git_hub,
        "portfolio": s.portfolio, "profileImage": s.profile_image,
        "academic": {
            "course": academic.course if academic else "", "department": academic.student.department.name if academic and academic.student.department else "",
            "semester": academic.semester if academic else s.semester, "cgpa": safe_decimal(academic.cgpa) if academic else 0,
            "tenthPercentage": safe_decimal(academic.tenth_percentage) if academic else 0,
            "twelfthPercentage": safe_decimal(academic.twelfth_percentage) if academic else 0,
            "backlogs": academic.backlogs if academic else 0, "graduationYear": academic.graduation_year if academic else 0,
        },
        "skills": skills, "certificates": certs, "createdAt": iso(s.created_at)
    }
    if resume:
        result["resume"] = {
            "fileName": resume.file_name, "uploadedAt": iso(resume.uploaded_at),
            "status": resume.status, "score": resume.score, "suggestions": resume.suggestions,
        }
    return result

def company_json(c):
    return {
        "id": str(c.id), "userId": str(c.user_id), "name": c.name, "logo": c.logo,
        "industry": c.industry, "location": c.location, "website": c.website,
        "description": c.description, "hrName": c.hr_name, "hrEmail": c.hr_email,
        "hrPhone": c.hr_phone, "isVerified": c.is_verified, "isApproved": c.is_approved,
        "createdAt": iso(c.created_at),
    }

def job_json(j):
    return {
        "id": str(j.id), "companyId": str(j.company_id), "title": j.title, "description": j.description,
        "location": j.location, "type": j.type, "salary": j.salary,
        "requiredSkills": [x.skill.name for x in j.job_skills.select_related("skill").all()],
        "minimumCGPA": safe_decimal(j.minimum_cgpa), "eligibleDepartments": j.eligible_departments or [],
        "deadline": iso(j.deadline), "vacancies": j.vacancies, "status": j.status, "createdAt": iso(j.created_at),
    }

def application_json(a):
    return {"id": str(a.id), "studentId": str(a.student_id), "jobId": str(a.job_id), "companyId": str(a.company_id),
            "appliedDate": iso(a.applied_date), "status": a.status}

def interview_json(i):
    return {"id": str(i.id), "studentId": str(i.student_id), "companyId": str(i.company_id), "jobId": str(i.job_id),
            "date": iso(i.date), "time": iso(i.time), "mode": i.mode, "location": i.location,
            "interviewer": i.interviewer, "status": i.status}

def offer_json(o):
    return {"id": str(o.id), "studentId": str(o.student_id), "jobId": str(o.job_id), "companyId": str(o.company_id),
            "salary": o.salary, "joiningDate": iso(o.joining_date), "offerDate": iso(o.offer_date),
            "notes": o.notes, "status": o.status}

def state_json():
    return {
        "users": [user_json(x) for x in UserAccount.objects.all()],
        "students": [student_json(x) for x in StudentProfile.objects.select_related("department","user").prefetch_related("student_skills__skill","certificates","resume").all()],
        "companies": [company_json(x) for x in Company.objects.all()],
        "jobs": [job_json(x) for x in Job.objects.prefetch_related("job_skills__skill").all()],
        "applications": [application_json(x) for x in Application.objects.all()],
        "interviews": [interview_json(x) for x in Interview.objects.all()],
        "offers": [offer_json(x) for x in Offer.objects.all()],
        "certificates": [{"id": str(x.id), "studentId": str(x.student_id), "name": x.name, "issuingOrganization": x.issuing_organization,
                         "date": iso(x.date), "credentialId": x.credential_id, "credentialLink": x.credential_link, "status": x.status} for x in Certificate.objects.all()],
        "notifications": [{"id": str(x.id), "userId": str(x.user_id), "title": x.title, "message": x.message,
                           "createdAt": iso(x.created_at), "read": x.read} for x in Notification.objects.all()],
        "placementDrives": [{"id": str(x.id), "name": x.name, "company": x.company, "date": iso(x.date),
                             "venue": x.venue, "eligibility": x.eligibility, "status": x.status} for x in PlacementDrive.objects.all()],
        "tickets": [{"id": str(x.id), "raisedBy": str(x.raised_by_id), "subject": x.subject, "message": x.message, "status": x.status} for x in Ticket.objects.all()],
        "auditLogs": [{"id": str(x.id), "user": x.user, "action": x.action, "createdAt": iso(x.created_at)} for x in AuditLog.objects.all()],
        "departments": [{"id": str(x.id), "name": x.name, "head": x.head} for x in Department.objects.all()],
    }

def seed_data():
    with transaction.atomic():
        depts = {
            name: Department.objects.get_or_create(name=name, defaults={"head": "Faculty Incharge"})[0]
            for name in ["Computer Science", "Information Technology", "Electronics"]
        }
        accounts = {}
        for email, role, name in [
            ("student@jg.edu","Student","Student User"),
            ("company@jg.edu","Company","Company User"),
            ("placement@jg.edu","Placement","Placement Cell"),
            ("admin@jg.edu","Admin","Admin User"),
            ("aditi@jg.edu","Student","Aditi Sharma"),
            ("dev@jg.edu","Student","Dev Patel"),
            ("isha@jg.edu","Student","Isha Shah"),
            ("neel@jg.edu","Student","Neel Mehta"),
            ("kavya@jg.edu","Student","Kavya Desai"),
        ]:
            password = DEMO_PASSWORDS.get(email, "student123")
            user, _ = UserAccount.objects.get_or_create(email=email, defaults={
                "id": sid(), "password": make_password(password), "role": role, "name": name,
                "is_active": True, "email_verified": True,
            })
            accounts[email] = user

        company, _ = Company.objects.get_or_create(user=accounts["company@jg.edu"], defaults={
            "id": sid(), "name": "JG Technologies", "industry": "Information Technology",
            "location": "Ahmedabad", "website": "https://example.com",
            "description": "Technology company hiring entry-level developers and analysts.",
            "hr_name": "HR Team", "hr_email": "company@jg.edu", "hr_phone": "9999999998",
            "is_verified": True, "is_approved": True,
        })
        CompanyHR.objects.get_or_create(company=company, email="company@jg.edu", defaults={"id": sid(), "name": "HR Team"})

        skills = {}
        for name in ["Python", "Django", "Java", "SQL", "HTML", "CSS", "JavaScript", "Angular", "Power BI"]:
            skills[name] = Skill.objects.get_or_create(name=name)[0]

        student_specs = [
            ("student@jg.edu", "Student User", "JG2026IT001", "Information Technology", "6", 8.4, ["Python", "Django", "SQL"]),
            ("aditi@jg.edu", "Aditi Sharma", "JG2026CS014", "Computer Science", "7", 8.1, ["Java", "SQL", "Angular"]),
            ("dev@jg.edu", "Dev Patel", "JG2026IT022", "Information Technology", "7", 7.9, ["Python", "Django", "JavaScript"]),
            ("isha@jg.edu", "Isha Shah", "JG2026CS031", "Computer Science", "6", 8.7, ["Java", "SQL", "Power BI"]),
            ("neel@jg.edu", "Neel Mehta", "JG2026EC008", "Electronics", "7", 7.6, ["Python", "SQL", "JavaScript"]),
            ("kavya@jg.edu", "Kavya Desai", "JG2026CS042", "Computer Science", "6", 8.9, ["Angular", "JavaScript", "CSS"]),
        ]
        students = {}
        for email, name, enrollment, department, semester, cgpa, student_skills in student_specs:
            student, _ = StudentProfile.objects.get_or_create(email=email, defaults={
                "id": sid(), "user": accounts[email], "full_name": name, "enrollment_number": enrollment,
                "department": depts[department], "semester": semester, "location": "Ahmedabad",
                "career_objective": "Seeking a graduate placement in software and product engineering.",
            })
            students[email] = student
            AcademicRecord.objects.get_or_create(student=student, defaults={
                "course": "B.Tech", "semester": semester, "cgpa": cgpa, "tenth_percentage": 84,
                "twelfth_percentage": 81, "backlogs": 0, "graduation_year": 2027,
            })
            for skill_name in student_skills:
                StudentSkill.objects.get_or_create(student=student, skill=skills[skill_name], defaults={"proficiency": "Advanced"})

        job_specs = [
            ("Junior Software Developer", "Ahmedabad", "Full Time", "₹5 LPA", ["Python", "Django", "SQL"]),
            ("Frontend Developer", "Ahmedabad", "Full Time", "₹4.8 LPA", ["Angular", "JavaScript", "CSS"]),
            ("Python Developer", "Hybrid", "Full Time", "₹5.5 LPA", ["Python", "Django", "SQL"]),
            ("Data Analyst", "Ahmedabad", "Full Time", "₹4.5 LPA", ["SQL", "Power BI", "Python"]),
            ("Graduate Engineer Trainee", "Gandhinagar", "Full Time", "₹4.2 LPA", ["Java", "SQL", "JavaScript"]),
            ("UI Developer Intern", "Remote", "Internship", "₹20k/month", ["Angular", "JavaScript", "CSS"]),
        ]
        jobs = []
        for title, location, job_type, salary, job_skills in job_specs:
            job, _ = Job.objects.get_or_create(company=company, title=title, defaults={
                "id": sid(), "description": f"Work with the JG Technologies team as a {title.lower()}.",
                "location": location, "type": job_type, "salary": salary, "minimum_cgpa": 6.5,
                "eligible_departments": ["Computer Science", "Information Technology", "Electronics"],
                "deadline": date(2026, 12, 31), "vacancies": 4, "status": "Approved",
            })
            jobs.append(job)
            for skill_name in job_skills:
                JobSkill.objects.get_or_create(job=job, skill=skills[skill_name])

        application_specs = [
            ("student@jg.edu", 0, "Shortlisted"),
            ("aditi@jg.edu", 1, "Under Review"),
            ("dev@jg.edu", 2, "Interview Scheduled"),
            ("isha@jg.edu", 3, "Selected"),
            ("neel@jg.edu", 4, "Applied"),
            ("kavya@jg.edu", 5, "Shortlisted"),
        ]
        for email, job_index, status in application_specs:
            Application.objects.get_or_create(student=students[email], job=jobs[job_index], defaults={
                "id": sid(), "company": company, "status": status,
            })
            if email in {"student@jg.edu", "dev@jg.edu", "isha@jg.edu"}:
                Interview.objects.get_or_create(student=students[email], job=jobs[job_index], defaults={
                    "id": sid(), "company": company, "date": date(2026, 10, 8 + job_index), "time": time(10, 30),
                    "mode": "Online", "location": "JG University", "interviewer": "JG Hiring Team", "status": "Scheduled",
                })
            if email == "isha@jg.edu":
                Offer.objects.get_or_create(student=students[email], job=jobs[job_index], defaults={
                    "id": sid(), "company": company, "salary": jobs[job_index].salary,
                    "joining_date": date(2027, 1, 15), "offer_date": date(2026, 9, 24),
                    "notes": "Demo offer for the 2026-27 placement season.", "status": "Accepted",
                })

        announcements = [
            ("JG Placement Drive", "Registration is open for the JG Technologies placement drive on 15 October."),
            ("Resume Review Week", "Book a resume review with the Placement Cell before 12 October."),
            ("Interview Preparation", "A technical interview preparation session is scheduled for this week."),
            ("New Graduate Roles", "Six JG Technologies graduate roles are now open in the student portal."),
            ("Profile Verification", "Please confirm your academic details and contact information before applying."),
        ]
        for student_email, student in students.items():
            for title, message in announcements:
                Notification.objects.get_or_create(user=student.user, title=title, message=message, defaults={"id": sid()})

        mock_test_questions = [
            ("Quantitative", "A train covers 90 km in 1.5 hours. What is its average speed?", ["45 km/h", "60 km/h", "75 km/h", "90 km/h"], 1, "Average speed is distance divided by time.", "Easy"),
            ("Logical", "Find the next number in the sequence: 3, 6, 12, 24, __.", ["30", "36", "48", "54"], 2, "Each number is multiplied by two.", "Easy"),
            ("Verbal", "Choose the closest synonym for 'concise'.", ["Brief", "Unclear", "Detailed", "Delayed"], 0, "Concise means brief and to the point.", "Easy"),
            ("Technical", "Which HTTP status code indicates a successful resource creation?", ["200", "201", "301", "404"], 1, "201 Created is commonly returned when a resource is created.", "Medium"),
            ("Quantitative", "A product priced at Rs. 800 is discounted by 15%. What is the sale price?", ["Rs. 660", "Rs. 680", "Rs. 700", "Rs. 720"], 1, "The discount is Rs. 120, so the sale price is Rs. 680.", "Medium"),
            ("Logical", "All developers use version control. Mira is a developer. What follows?", ["Mira uses version control", "Mira manages a team", "All users are developers", "No conclusion can be drawn"], 0, "This follows directly from the two statements.", "Medium"),
            ("Technical", "Which data structure follows the FIFO principle?", ["Stack", "Queue", "Tree", "Heap"], 1, "A queue processes items in first-in, first-out order.", "Easy"),
            ("Technical", "What is the average-case lookup time for a key in a hash table?", ["O(1)", "O(log n)", "O(n)", "O(n log n)"], 0, "Hash tables provide average-case constant-time lookup.", "Medium"),
        ]
        for category, question, options, answer, explanation, difficulty in mock_test_questions:
            MockTestQuestion.objects.get_or_create(
                question=question,
                defaults={
                    "id": sid(), "category": category, "options": options, "answer": answer,
                    "explanation": explanation, "difficulty": difficulty,
                },
            )

        PlacementDrive.objects.get_or_create(name="JG Tech Placement Drive", defaults={
            "id": sid(), "company": company.name, "date": date(2026, 10, 15),
            "venue": "JG University Campus", "eligibility": "CGPA 6.5+, 2027 batch",
        })
        if not AuditLog.objects.exists():
            AuditLog.objects.create(id=sid(), user="System", action="JG Placement Portal demo data initialized.")

def get_user(token):
    from .auth import decode_token
    payload = decode_token(token)
    if not payload:
        return None
    try:
        return UserAccount.objects.get(id=payload["sub"], is_active=True)
    except UserAccount.DoesNotExist:
        return None
