import hashlib
import re
from pathlib import Path

try:
    from pypdf import PdfReader
except Exception:
    PdfReader = None

COMMON_SKILLS = {
    "python","java","javascript","typescript","angular","react","node","django","flask","sql","mysql",
    "html","css","bootstrap","git","github","c","c++","data analysis","machine learning","excel",
    "power bi","communication","problem solving","rest api","api","docker","aws"
}

def sha256_file(uploaded):
    h = hashlib.sha256()
    for chunk in uploaded.chunks():
        h.update(chunk)
    uploaded.seek(0)
    return h.hexdigest()

def extract_pdf_text(uploaded):
    if PdfReader is None:
        return ""
    try:
        reader = PdfReader(uploaded)
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        uploaded.seek(0)
        return text[:200000]
    except Exception:
        uploaded.seek(0)
        return ""

def parse_resume(text):
    lower = text.lower()
    found = sorted([skill for skill in COMMON_SKILLS if skill in lower])
    sections = {
        "education": any(k in lower for k in ["education", "qualification", "degree", "bachelor", "master"]),
        "skills": any(k in lower for k in ["skills", "technical skills"]),
        "experience": any(k in lower for k in ["experience", "internship", "work experience"]),
        "projects": "project" in lower,
        "contact": bool(re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)),
        "summary": any(k in lower for k in ["summary", "objective", "profile"]),
    }
    return {"skills": found, "sections": sections, "textLength": len(text)}

def score_resume(parsed):
    sections = parsed["sections"]
    skills = len(parsed["skills"])
    text_length = parsed.get("textLength", 0)

    present_sections = sum(1 for ok in sections.values() if ok)
    section_score = present_sections * 12

    if skills >= 10:
        skill_score = 25
    elif skills >= 6:
        skill_score = 15
    elif skills >= 3:
        skill_score = 8
    else:
        skill_score = 0

    length_score = 10 if text_length >= 1500 else 5 if text_length >= 500 else 0

    score = section_score + skill_score + length_score

    if not sections.get("experience"):
        score -= 10
    if not sections.get("projects"):
        score -= 5
    if not sections.get("contact"):
        score -= 10
    if skills < 3:
        score -= 10

    score = max(0, min(100, score))

    tips = []
    for name, ok in sections.items():
        if not ok:
            tips.append(f"Add a clear {name} section." if name != "contact" else "Add a valid email/contact section.")
    if skills < 5:
        tips.append("Add more role-relevant technical skills.")
    if not sections.get("experience"):
        tips.append("Include internship or work experience to strengthen your profile.")
    if not sections.get("projects"):
        tips.append("Add academic or personal projects to show practical work.")
    if text_length < 500:
        tips.append("Expand your resume content with more concrete project and skill details.")

    return score, tips

def match_job(student, job):
    student_skills = {x.skill.name.lower() for x in student.student_skills.select_related("skill").all()}
    required = {x.skill.name.lower() for x in job.job_skills.select_related("skill").all()}
    matched = sorted(required & student_skills)
    missing = sorted(required - student_skills)
    skill_score = (len(matched) / len(required) * 100) if required else 100
    academic = getattr(student, "academic", None)
    cgpa = float(academic.cgpa) if academic else 0
    cgpa_score = min(100, (cgpa / float(job.minimum_cgpa or 1)) * 100) if job.minimum_cgpa else 100
    dept_ok = not job.eligible_departments or (student.department and student.department.name in job.eligible_departments)
    eligibility_score = (cgpa_score * 0.7 + (100 if dept_ok else 0) * 0.3)
    fit = round(skill_score * 0.7 + eligibility_score * 0.3)
    return {"score": min(100, fit), "matchedSkills": matched, "missingSkills": missing,
            "eligible": bool(dept_ok and cgpa >= float(job.minimum_cgpa or 0))}

def readiness(student):
    academic = getattr(student, "academic", None)
    checks = {
        "profile": all([student.full_name, student.mobile, student.career_objective]),
        "academic": bool(academic and float(academic.cgpa) > 0),
        "skills": student.student_skills.exists(),
        "resume": hasattr(student, "resume"),
        "certificates": student.certificates.exists(),
    }
    score = round(sum(checks.values()) / len(checks) * 100)
    return score, checks
