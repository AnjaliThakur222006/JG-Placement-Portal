import json
from functools import wraps
from datetime import date, datetime, time
from django.conf import settings
from django.core.files.storage import default_storage
from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from . import db_service as db
from .auth import create_token
from .models import *
from .ai_service import sha256_file, extract_pdf_text, parse_resume, score_resume, match_job, readiness

def body(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        return None

def json_response(data, status=200):
    return JsonResponse(data, status=status, safe=isinstance(data, dict))

def token_from(request):
    return request.headers.get("X-API-Token") or request.headers.get("Authorization", "").removeprefix("Bearer ").strip()

def require_auth(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        user = db.get_user(token_from(request))
        if not user:
            return json_response({"detail": "Authentication required."}, 401)
        request.api_user = user
        return view(request, *args, **kwargs)
    return wrapped

def health(request):
    try:
        UserAccount.objects.exists()
        database = True
    except Exception:
        database = False
    return json_response({"status": "ok", "service": "JG Placement Portal API", "database": database, "ai": True})

@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return json_response({"detail": "Method not allowed."}, 405)
    data = body(request)
    if not isinstance(data, dict):
        return json_response({"detail": "Invalid JSON."}, 400)
    try:
        user = UserAccount.objects.get(email=str(data.get("email","")).strip().lower(), role=str(data.get("role","Student")))
    except UserAccount.DoesNotExist:
        return json_response({"detail": "Invalid credentials."}, 401)
    from django.contrib.auth.hashers import check_password
    if not user.is_active or not check_password(str(data.get("password","")), user.password):
        LoginHistory.objects.create(user=user, success=False, ip_address=request.META.get("REMOTE_ADDR"))
        return json_response({"detail": "Invalid credentials."}, 401)
    if not user.email_verified:
        return json_response({"detail": "Email verification required. Request and verify the OTP before login.", "emailVerified": False}, 403)
    if not user.email_verified:
        return json_response({"detail": "Email verification required. Request and verify the OTP before login.", "emailVerified": False}, 403)
    LoginHistory.objects.create(user=user, success=True, ip_address=request.META.get("REMOTE_ADDR"))
    AuditLog.objects.create(id=db.sid(), user=user.name, action="Logged in.")
    return json_response({"user": db.user_json(user), "token": create_token(user)})

@csrf_exempt
def register_view(request):
    if request.method != "POST":
        return json_response({"detail": "Method not allowed."}, 405)
    data = body(request)
    required = ["name","email","password","enrollmentNumber","department","semester","mobile"]
    if not isinstance(data, dict) or any(not str(data.get(k,"")).strip() for k in required):
        return json_response({"detail": "All registration fields are required."}, 400)
    if len(str(data["password"])) < 8 or not any(c.isupper() for c in str(data["password"])) or not any(c.isdigit() for c in str(data["password"])) or not any(not c.isalnum() for c in str(data["password"])):
        return json_response({"detail": "Password must be at least 8 characters and include uppercase, number and special character."}, 400)
    email = str(data["email"]).strip().lower()
    if UserAccount.objects.filter(email=email).exists() or StudentProfile.objects.filter(enrollment_number=data["enrollmentNumber"]).exists():
        return json_response({"detail": "Email or enrollment number already exists."}, 409)
    try:
        department = Department.objects.get(name=data["department"])
    except Department.DoesNotExist:
        department = Department.objects.create(name=data["department"], head="Faculty Incharge")
    user = UserAccount.objects.create(id=db.sid(), email=email, password=__import__("django.contrib.auth.hashers", fromlist=["make_password"]).make_password(data["password"]),
                                      role="Student", name=data["name"], is_active=True, email_verified=False)
    student = StudentProfile.objects.create(id=db.sid(), user=user, full_name=data["name"], email=email,
        enrollment_number=data["enrollmentNumber"], department=department, semester=data["semester"], mobile=data["mobile"])
    AcademicRecord.objects.create(student=student, course="B.Sc. Information Technology", semester=data["semester"], graduation_year=2026)
    AuditLog.objects.create(id=db.sid(), user=data["name"], action="Student registered; email verification pending.")
    import secrets
    from django.contrib.auth.hashers import make_password
    from django.utils import timezone
    code=f"{secrets.randbelow(1000000):06d}"
    EmailOTP.objects.create(id=db.sid(), user=user, purpose="verify", code_hash=make_password(code), expires_at=timezone.now()+__import__("datetime").timedelta(minutes=10))
    sent=send_email_or_debug("Verify your JG Placement Portal account", f"Your verification code is {code}. It expires in 10 minutes.", email)
    response={"user": db.user_json(user), "student": db.student_json(student), "verificationRequired":True, "emailSent":sent}
    if settings.DEBUG: response["demoOtp"]=code
    return json_response(response, 201)

@csrf_exempt
@require_auth
def logout_view(request):
    AuditLog.objects.create(id=db.sid(), user=request.api_user.name, action="Logged out.")
    return json_response({"detail":"Logged out."})

def ensure_seed():
    db.seed_data()

@csrf_exempt
def state_view(request):
    try:
        ensure_seed()
        if request.method == "GET":
            return json_response(db.state_json())
        if request.method == "PUT":
            if not db.get_user(token_from(request)):
                return json_response({"detail":"Authentication required."},401)
            data = body(request)
            if not isinstance(data, dict):
                return json_response({"detail":"State must be a JSON object."},400)
            actor = request.api_user if hasattr(request,"api_user") else db.get_user(token_from(request))
            # Enforce panel-level write permissions before synchronizing the legacy Angular state contract.
            if actor.role != "Admin":
                allowed = {
                    "Student": {"students","applications","interviews","offers","certificates","notifications","tickets"},
                    "Company": {"companies","jobs","applications","interviews","offers","notifications"},
                    "Placement": {"students","companies","jobs","applications","interviews","offers","certificates","placementDrives","tickets","notifications","departments"},
                }.get(actor.role,set())
                data = {k:v for k,v in data.items() if k in allowed}
            sync_state(data, actor)
            return json_response(db.state_json())
    except Exception as exc:
        return json_response({"detail": f"Database error: {exc}"}, 500)
    return json_response({"detail":"Method not allowed."},405)

# State sync keeps the existing Angular UI contract while storing the actual records in MySQL.
@transaction.atomic
def sync_state(data, actor=None):
    for item in data.get("departments", []):
        try:
            d = Department.objects.get(id=item["id"])
            d.name, d.head = item.get("name",d.name), item.get("head",d.head); d.save()
        except Department.DoesNotExist:
            Department.objects.create(id=item["id"], name=item.get("name","Department"), head=item.get("head",""))
    dept_by_name = {d.name:d for d in Department.objects.all()}

    for item in data.get("users", []):
        try:
            u = UserAccount.objects.get(id=item["id"])
            u.email, u.name, u.role, u.is_active = item.get("email",u.email), item.get("name",u.name), item.get("role",u.role), item.get("isActive",u.is_active)
            u.save()
        except UserAccount.DoesNotExist:
            # Never accept plaintext passwords from the Angular state as a database credential.
            from django.contrib.auth.hashers import make_password
            pw = item.get("password") or "TempPassword!2026"
            UserAccount.objects.create(id=item["id"], email=item["email"], password=make_password(pw), role=item.get("role","Student"), name=item.get("name","User"), is_active=item.get("isActive",True))

    for item in data.get("students", []):
        uid = item.get("userId")
        try: u = UserAccount.objects.get(id=uid)
        except UserAccount.DoesNotExist: continue
        dept = dept_by_name.get(item.get("department")) or Department.objects.filter(name=item.get("department")).first()
        s, _ = StudentProfile.objects.get_or_create(id=item["id"], defaults={"user":u,"full_name":item.get("fullName",""),"email":item.get("email",u.email),"enrollment_number":item.get("enrollmentNumber",item["id"]),"department":dept})
        s.user, s.full_name, s.email, s.enrollment_number, s.department = u, item.get("fullName",s.full_name), item.get("email",s.email), item.get("enrollmentNumber",s.enrollment_number), dept
        s.semester, s.mobile, s.location, s.about, s.career_objective = item.get("semester",s.semester), item.get("mobile",s.mobile), item.get("location",s.location), item.get("about",s.about), item.get("careerObjective",s.career_objective)
        s.linked_in, s.git_hub, s.portfolio, s.profile_image = item.get("linkedIn",s.linked_in), item.get("gitHub",s.git_hub), item.get("portfolio",s.portfolio), item.get("profileImage",s.profile_image); s.save()
        academic = item.get("academic") or {}
        AcademicRecord.objects.update_or_create(student=s, defaults={"course":academic.get("course",""),"semester":academic.get("semester",s.semester),
            "cgpa":academic.get("cgpa",0),"tenth_percentage":academic.get("tenthPercentage",0),"twelfth_percentage":academic.get("twelfthPercentage",0),
            "backlogs":academic.get("backlogs",0),"graduation_year":academic.get("graduationYear",0)})
        StudentSkill.objects.filter(student=s).delete()
        for sk in item.get("skills",[]):
            skill, _ = Skill.objects.get_or_create(name=str(sk.get("name","")).strip())
            if skill.name: StudentSkill.objects.create(student=s, skill=skill, proficiency=sk.get("proficiency","Beginner"))
        for cert in item.get("certificates",[]):
            Certificate.objects.update_or_create(id=cert.get("id",db.sid()), defaults={"student":s,"name":cert.get("name","Certificate"),
                "issuing_organization":cert.get("issuingOrganization",""),"credential_id":cert.get("credentialId",""),"credential_link":cert.get("credentialLink","")})

    for item in data.get("companies", []):
        try: u = UserAccount.objects.get(id=item.get("userId"))
        except UserAccount.DoesNotExist: continue
        c, _ = Company.objects.get_or_create(id=item["id"], defaults={"user":u,"name":item.get("name","Company")})
        for f, k in [("name","name"),("logo","logo"),("industry","industry"),("location","location"),("website","website"),("description","description"),("hr_name","hrName"),("hr_email","hrEmail"),("hr_phone","hrPhone"),("is_verified","isVerified"),("is_approved","isApproved")]:
            setattr(c,f,item.get(k,getattr(c,f)))
        c.user=u; c.save()

    for item in data.get("jobs", []):
        try: company = Company.objects.get(id=item.get("companyId"))
        except Company.DoesNotExist: continue
        j, _ = Job.objects.get_or_create(id=item["id"], defaults={"company":company,"title":item.get("title","Job")})
        j.company=company; j.title=item.get("title",j.title); j.description=item.get("description",""); j.location=item.get("location",""); j.type=item.get("type","")
        j.salary=item.get("salary",""); j.minimum_cgpa=item.get("minimumCGPA",0); j.eligible_departments=item.get("eligibleDepartments",[])
        deadline=item.get("deadline"); j.deadline=datetime.fromisoformat(deadline).date() if deadline and "T" in deadline else (date.fromisoformat(deadline) if deadline else None)
        j.vacancies=item.get("vacancies",1); j.status=item.get("status","Pending"); j.save()
        JobSkill.objects.filter(job=j).delete()
        for name in item.get("requiredSkills",[]):
            sk,_=Skill.objects.get_or_create(name=name); JobSkill.objects.create(job=j,skill=sk)

    for item in data.get("applications", []):
        try:
            s=StudentProfile.objects.get(id=item["studentId"]); j=Job.objects.get(id=item["jobId"]); c=Company.objects.get(id=item["companyId"])
            Application.objects.update_or_create(id=item["id"],defaults={"student":s,"job":j,"company":c,"status":item.get("status","Applied")})
        except Exception: pass
    for item in data.get("interviews", []):
        try:
            s=StudentProfile.objects.get(id=item["studentId"]); j=Job.objects.get(id=item["jobId"]); c=Company.objects.get(id=item["companyId"])
            Interview.objects.update_or_create(id=item["id"],defaults={"student":s,"job":j,"company":c,"date":date.fromisoformat(str(item["date"])[:10]),"time":time.fromisoformat(str(item["time"])[:8]),
                "mode":item.get("mode",""),"location":item.get("location",""),"interviewer":item.get("interviewer",""),"status":item.get("status","Scheduled")})
        except Exception: pass
    for item in data.get("offers", []):
        try:
            s=StudentProfile.objects.get(id=item["studentId"]); j=Job.objects.get(id=item["jobId"]); c=Company.objects.get(id=item["companyId"])
            Offer.objects.update_or_create(id=item["id"],defaults={"student":s,"job":j,"company":c,"salary":item.get("salary",""),"notes":item.get("notes",""),"status":item.get("status","Pending")})
        except Exception: pass
    for item in data.get("notifications", []):
        try:
            u=UserAccount.objects.get(id=item["userId"]); Notification.objects.update_or_create(id=item["id"],defaults={"user":u,"title":item.get("title",""),"message":item.get("message",""),"read":item.get("read",False)})
        except Exception: pass
    for item in data.get("placementDrives", []):
        pd,_=PlacementDrive.objects.get_or_create(id=item["id"]); pd.name=item.get("name",""); pd.company=item.get("company",""); pd.venue=item.get("venue",""); pd.eligibility=item.get("eligibility",""); pd.status=item.get("status","")
        if item.get("date"): pd.date=date.fromisoformat(str(item["date"])[:10])
        pd.save()
    for item in data.get("tickets", []):
        try:
            u=UserAccount.objects.get(id=item["raisedBy"]); Ticket.objects.update_or_create(id=item["id"],defaults={"raised_by":u,"subject":item.get("subject",""),"message":item.get("message",""),"status":item.get("status","Open")})
        except Exception: pass
    if actor:
        AuditLog.objects.create(id=db.sid(),user=actor.name,action="Portal state synchronized from UI.")

@csrf_exempt
@require_auth
def resource_collection(request, resource):
    if request.method == "GET":
        return json_response(db.state_json().get(resource, []))
    if request.method == "POST":
        current=db.state_json(); item=body(request)
        if not isinstance(item,dict): return json_response({"detail":"Invalid JSON object."},400)
        item.setdefault("id",db.sid())
        current.setdefault(resource,[]).append(item); sync_state(current,request.api_user)
        return json_response(next((x for x in db.state_json().get(resource,[]) if x.get("id")==item["id"]),item),201)
    return json_response({"detail":"Method not allowed."},405)

@csrf_exempt
@require_auth
def resource_item(request, resource, item_id):
    current=db.state_json(); items=current.get(resource,[])
    item=next((x for x in items if str(x.get("id"))==str(item_id)),None)
    if request.method=="GET": return json_response(item if item else {"detail":"Not found."},200 if item else 404)
    if request.method in ("PUT","PATCH"):
        payload=body(request)
        if not isinstance(payload,dict): return json_response({"detail":"Invalid JSON object."},400)
        if not item: return json_response({"detail":"Not found."},404)
        if request.method=="PATCH": item.update(payload)
        else: payload["id"]=item_id; item=payload
        current[resource]=[item if str(x.get("id"))==str(item_id) else x for x in items]
        sync_state(current,request.api_user)
        return json_response(next((x for x in db.state_json().get(resource,[]) if str(x.get("id"))==str(item_id)),item))
    if request.method=="DELETE":
        if not item: return json_response({"detail":"Not found."},404)
        current[resource]=[x for x in items if str(x.get("id"))!=str(item_id)]
        sync_state(current,request.api_user)
        return json_response({"deleted":True})
    return json_response({"detail":"Method not allowed."},405)

@csrf_exempt
@require_auth
def resume_upload(request):
    if request.method!="POST" or "file" not in request.FILES:
        return json_response({"detail":"Send a PDF file in multipart field 'file'."},400)
    user=request.api_user
    if user.role!="Student": return json_response({"detail":"Only students can upload resumes."},403)
    uploaded=request.FILES["file"]
    if uploaded.size > 5*1024*1024: return json_response({"detail":"Resume must be 5 MB or smaller."},400)
    if uploaded.content_type!="application/pdf" or not uploaded.name.lower().endswith(".pdf"):
        return json_response({"detail":"Only PDF resumes are accepted."},400)
    student=StudentProfile.objects.get(user=user)
    digest=sha256_file(uploaded)
    duplicate=Resume.objects.filter(sha256=digest).exclude(student=student).exists()
    text=extract_pdf_text(uploaded)
    parsed=db_parse=parse_resume(text)
    score,tips=score_resume(parsed)
    existing=Resume.objects.filter(student=student).first()
    if existing and existing.file:
        try: default_storage.delete(existing.file.name)
        except Exception: pass
    saved_name=default_storage.save(f"resumes/{student.id}_{uploaded.name}",uploaded)
    resume,created=Resume.objects.update_or_create(student=student,defaults={
        "id": existing.id if existing else db.sid(),"file":saved_name,"file_name":uploaded.name,"sha256":digest,
        "status":"Flagged" if duplicate else "Uploaded","score":score,"parsed_data":parsed,
        "suggestions":tips + (["Duplicate resume hash detected."] if duplicate else [])
    })
    AIAnalysis.objects.create(id=db.sid(),student=student,analysis_type="resume",score=score,result={"parsed":parsed,"suggestions":resume.suggestions,"duplicate":duplicate})
    return json_response({"resume":{"fileName":resume.file_name,"uploadedAt":resume.uploaded_at.isoformat(),"status":resume.status,"score":resume.score,"suggestions":resume.suggestions},"analysis":{"score":score,"parsed":parsed,"duplicate":duplicate}})

@csrf_exempt
@require_auth
def resume_delete(request):
    if request.method!="DELETE": return json_response({"detail":"Method not allowed."},405)
    if request.api_user.role!="Student": return json_response({"detail":"Only students can remove resumes."},403)
    student=StudentProfile.objects.get(user=request.api_user)
    resume=Resume.objects.filter(student=student).first()
    if resume:
        try: default_storage.delete(resume.file.name)
        except Exception: pass
        resume.delete()
    return json_response({"deleted":True})

@require_auth
def ai_skill_gap(request):
    if request.method!="GET": return json_response({"detail":"Method not allowed."},405)
    student=StudentProfile.objects.get(user=request.api_user)
    jobs=Job.objects.filter(status="Approved").prefetch_related("job_skills__skill")
    result=[]
    for job in jobs:
        result.append({"job":db.job_json(job),**match_job(student,job)})
    result.sort(key=lambda x:x["score"],reverse=True)
    return json_response({"results":result[:10]})

@require_auth
def ai_readiness(request):
    if request.method!="GET": return json_response({"detail":"Method not allowed."},405)
    student=StudentProfile.objects.get(user=request.api_user)
    score,checks=readiness(student)
    AIAnalysis.objects.create(id=db.sid(),student=student,analysis_type="readiness",score=score,result=checks)
    return json_response({"score":score,"checks":checks})

@require_auth
def ai_job_match(request, job_id):
    if request.method!="GET": return json_response({"detail":"Method not allowed."},405)
    student=StudentProfile.objects.get(user=request.api_user)
    try: job=Job.objects.get(id=job_id)
    except Job.DoesNotExist: return json_response({"detail":"Job not found."},404)
    result=match_job(student,job)
    AIAnalysis.objects.create(id=db.sid(),student=student,job=job,analysis_type="match",score=result["score"],result=result)
    return json_response(result)

# ---------- Extended SRS workflows ----------
def role_required(*roles):
    def deco(view):
        @wraps(view)
        @require_auth
        def wrapped(request, *args, **kwargs):
            if request.api_user.role not in roles:
                return json_response({"detail": "This action is not allowed for your role."}, 403)
            return view(request, *args, **kwargs)
        return wrapped
    return deco

def send_email_or_debug(subject, message, recipient):
    from django.core.mail import send_mail
    try:
        if getattr(settings, 'EMAIL_HOST', ''):
            send_mail(subject, message, getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jg.edu'), [recipient], fail_silently=True)
            return True
    except Exception:
        pass
    return False

@csrf_exempt
def request_otp(request):
    if request.method != 'POST': return json_response({'detail':'Method not allowed.'},405)
    data = body(request) or {}
    email = str(data.get('email','')).strip().lower(); purpose = str(data.get('purpose','verify'))
    if purpose not in ('verify','reset') or not email: return json_response({'detail':'Valid email and purpose are required.'},400)
    try: user = UserAccount.objects.get(email=email)
    except UserAccount.DoesNotExist: return json_response({'detail':'No account found for this email.'},404)
    import secrets
    from django.contrib.auth.hashers import make_password
    from django.utils import timezone
    EmailOTP.objects.filter(user=user, purpose=purpose, used=False).update(used=True)
    code = f'{secrets.randbelow(1000000):06d}'
    EmailOTP.objects.create(id=db.sid(), user=user, purpose=purpose, code_hash=make_password(code), expires_at=timezone.now()+__import__('datetime').timedelta(minutes=10))
    sent = send_email_or_debug('JG Placement Portal OTP', f'Your verification code is {code}. It expires in 10 minutes.', email)
    response = {'detail':'OTP generated. Check your email.' if sent else 'OTP generated. SMTP is not configured; use the demo OTP returned in development mode.', 'emailSent':sent}
    if settings.DEBUG: response['demoOtp'] = code
    return json_response(response)

@csrf_exempt
def verify_otp(request):
    if request.method != 'POST': return json_response({'detail':'Method not allowed.'},405)
    data=body(request) or {}; email=str(data.get('email','')).strip().lower(); code=str(data.get('otp','')).strip(); purpose=str(data.get('purpose','verify'))
    try: user=UserAccount.objects.get(email=email)
    except UserAccount.DoesNotExist: return json_response({'detail':'Account not found.'},404)
    from django.utils import timezone
    from django.contrib.auth.hashers import check_password
    otp=EmailOTP.objects.filter(user=user,purpose=purpose,used=False,expires_at__gt=timezone.now()).order_by('-created_at').first()
    if not otp or not check_password(code,otp.code_hash):
        if otp: otp.attempts += 1; otp.save(update_fields=['attempts'])
        return json_response({'detail':'Invalid or expired OTP.'},400)
    otp.used=True; otp.save(update_fields=['used'])
    if purpose=='verify': user.email_verified=True; user.save(update_fields=['email_verified'])
    return json_response({'verified':True,'purpose':purpose})

@csrf_exempt
def reset_password(request):
    if request.method!='POST': return json_response({'detail':'Method not allowed.'},405)
    data=body(request) or {}; email=str(data.get('email','')).strip().lower(); code=str(data.get('otp','')).strip(); new_password=str(data.get('password',''))
    if len(new_password)<8 or not any(c.isupper() for c in new_password) or not any(c.isdigit() for c in new_password) or not any(not c.isalnum() for c in new_password):
        return json_response({'detail':'Password must be 8+ characters with uppercase, number and special character.'},400)
    try: user=UserAccount.objects.get(email=email)
    except UserAccount.DoesNotExist: return json_response({'detail':'Account not found.'},404)
    from django.utils import timezone
    from django.contrib.auth.hashers import check_password, make_password
    otp=EmailOTP.objects.filter(user=user,purpose='reset',used=False,expires_at__gt=timezone.now()).order_by('-created_at').first()
    if not otp or not check_password(code,otp.code_hash): return json_response({'detail':'Invalid or expired OTP.'},400)
    otp.used=True; otp.save(update_fields=['used']); user.password=make_password(new_password); user.save(update_fields=['password'])
    AuditLog.objects.create(id=db.sid(),user=user.name,action='Password reset completed via OTP.')
    return json_response({'reset':True})

@csrf_exempt
@role_required('Student')
def certificate_upload(request):
    if request.method!='POST' or 'file' not in request.FILES: return json_response({'detail':'PDF certificate file is required.'},400)
    f=request.FILES['file']
    if f.size>5*1024*1024 or f.content_type!='application/pdf' or not f.name.lower().endswith('.pdf'): return json_response({'detail':'Certificate must be a PDF up to 5 MB.'},400)
    student=StudentProfile.objects.get(user=request.api_user); digest=sha256_file(f)
    duplicate=Certificate.objects.filter(sha256=digest).exists()
    name=str((body(request) or {}).get('name') or f.name.rsplit('.',1)[0])
    saved=default_storage.save(f'certificates/{student.id}_{f.name}',f)
    cert=Certificate.objects.create(id=db.sid(),student=student,name=name,issuing_organization=str((body(request) or {}).get('issuingOrganization','')),file=saved,sha256=digest,status='Flagged' if duplicate else 'Pending')
    AIAnalysis.objects.create(id=db.sid(),student=student,analysis_type='certificate',score=0,result={'duplicate':duplicate,'certificateId':str(cert.id)})
    return json_response({'id':str(cert.id),'status':cert.status,'duplicate':duplicate},201)

@csrf_exempt
@role_required('Placement','Admin')
def verify_record(request, record_type, record_id):
    data=body(request) or {}; action=str(data.get('action','verify')).lower()
    if record_type=='certificate':
        try: obj=Certificate.objects.get(id=record_id)
        except Certificate.DoesNotExist: return json_response({'detail':'Certificate not found.'},404)
        obj.status='Verified' if action=='verify' else 'Rejected'; obj.save(update_fields=['status'])
    elif record_type=='resume':
        try: obj=Resume.objects.get(id=record_id)
        except Resume.DoesNotExist: return json_response({'detail':'Resume not found.'},404)
        obj.status='Verified' if action=='verify' else 'Flagged'; obj.save(update_fields=['status'])
    elif record_type=='company':
        try: obj=Company.objects.get(id=record_id)
        except Company.DoesNotExist: return json_response({'detail':'Company not found.'},404)
        obj.is_verified=action=='verify'; obj.is_approved=action=='verify'; obj.save(update_fields=['is_verified','is_approved'])
    elif record_type=='job':
        try: obj=Job.objects.get(id=record_id)
        except Job.DoesNotExist: return json_response({'detail':'Job not found.'},404)
        obj.status='Approved' if action=='verify' else 'Rejected'; obj.save(update_fields=['status'])
    else: return json_response({'detail':'Unsupported verification type.'},400)
    AuditLog.objects.create(id=db.sid(),user=request.api_user.name,action=f'{record_type} {record_id} -> {action}')
    return json_response({'updated':True,'action':action})

@role_required('Company')
def candidate_ranking(request, job_id):
    if request.method!='GET': return json_response({'detail':'Method not allowed.'},405)
    try: company=Company.objects.get(user=request.api_user); job=Job.objects.get(id=job_id,company=company)
    except (Company.DoesNotExist,Job.DoesNotExist): return json_response({'detail':'Job not found.'},404)
    rows=[]
    for app in Application.objects.filter(job=job).select_related('student'):
        try: result=match_job(app.student,job)
        except Exception: result={'score':0,'missingSkills':[],'matchedSkills':[]}
        rows.append({'applicationId':str(app.id),'studentId':str(app.student.id),'studentName':app.student.full_name,'status':app.status,**result})
    rows.sort(key=lambda x:x.get('score',0),reverse=True)
    return json_response({'job':db.job_json(job),'candidates':rows})

@csrf_exempt
@role_required('Company')
def candidate_feedback(request, application_id):
    if request.method not in ('POST','PUT','PATCH'): return json_response({'detail':'Method not allowed.'},405)
    data=body(request) or {}
    try: company=Company.objects.get(user=request.api_user); app=Application.objects.get(id=application_id,company=company)
    except (Company.DoesNotExist,Application.DoesNotExist): return json_response({'detail':'Application not found.'},404)
    note={'rating':max(1,min(5,int(data.get('rating',0) or 0))),'strengths':str(data.get('strengths','')),'weaknesses':str(data.get('weaknesses','')),'comments':str(data.get('comments',''))}
    setting, _ = SystemSetting.objects.get_or_create(key=f'feedback:{application_id}',defaults={'value':note}); setting.value=note; setting.save(update_fields=['value','updated_at'])
    AuditLog.objects.create(id=db.sid(),user=request.api_user.name,action=f'Candidate feedback submitted for {application_id}.')
    return json_response(note)

@role_required('Student')
def mock_test(request):
    student=StudentProfile.objects.get(user=request.api_user)
    if request.method=='GET':
        qs=list(MockTestQuestion.objects.all().order_by('?')[:10])
        if not qs:
            seeds=[('Quantitative','If a train travels 60 km in 1.5 hours, its speed is?', ['30 km/h','40 km/h','45 km/h','60 km/h'],1,'Speed = distance/time.'),('Logical','Find the next number: 2, 4, 8, 16, ?', ['20','24','32','36'],2,'Each number doubles.'),('Verbal','Choose the synonym of rapid.', ['Slow','Quick','Late','Weak'],1,'Rapid means quick.'),('Technical','Which HTTP method is normally used to create a resource?', ['GET','POST','DELETE','HEAD'],1,'POST is commonly used for creation.')]
            for cat,q,opts,ans,exp in seeds: MockTestQuestion.objects.create(id=db.sid(),category=cat,question=q,options=opts,answer=ans,explanation=exp)
            qs=list(MockTestQuestion.objects.all()[:10])
        return json_response({'questions':[{'id':str(x.id),'category':x.category,'question':x.question,'options':x.options,'difficulty':x.difficulty} for x in qs]})
    if request.method=='POST':
        data=body(request) or {}; answers=data.get('answers',{}); questions=MockTestQuestion.objects.filter(id__in=list(answers.keys())); score=sum(1 for q in questions if int(answers.get(str(q.id),-1))==q.answer); total=questions.count(); attempt=MockTestAttempt.objects.create(id=db.sid(),student=student,score=score,total=total,answers=answers,completed_at=__import__('django.utils.timezone',fromlist=['now']).now()); return json_response({'score':score,'total':total,'percentage':round(score*100/total,2) if total else 0,'attemptId':str(attempt.id)})
    return json_response({'detail':'Method not allowed.'},405)

@role_required('Student')
def mock_interview(request):
    student=StudentProfile.objects.get(user=request.api_user)
    if request.method=='GET':
        questions=['Tell us about yourself.','Why should we hire you?','Describe a challenging project you completed.','What is your biggest technical strength?','Where do you see yourself in five years?']
        return json_response({'questions':questions,'guidance':'Answer each question clearly using a situation, action and result structure.'})
    if request.method=='POST':
        data=body(request) or {}; answers=data.get('answers',{}); questions=data.get('questions') or []
        answered=sum(1 for i in range(len(questions)) if str(answers.get(str(i),'')).strip()); score=round(answered*100/max(len(questions),1)); feedback=['Use concrete examples.','Mention measurable outcomes.','Keep answers structured and concise.']
        attempt=MockInterviewAttempt.objects.create(id=db.sid(),student=student,questions=questions,answers=answers,score=score,feedback=feedback); return json_response({'score':score,'feedback':feedback,'attemptId':str(attempt.id)})
    return json_response({'detail':'Method not allowed.'},405)

@role_required('Student')
def portfolio_view(request):
    s=StudentProfile.objects.get(user=request.api_user); academic=getattr(s,'academic',None); resume=getattr(s,'resume',None)
    return json_response({'profile':db.student_json(s),'academic':{'cgpa':float(academic.cgpa) if academic else 0,'graduationYear':academic.graduation_year if academic else 0},'skills':[x.skill.name for x in s.student_skills.select_related('skill')],'certificates':[{'name':x.name,'issuer':x.issuing_organization,'status':x.status} for x in s.certificates.all()],'resumeScore':resume.score if resume else 0,'shareUrl':f'/portfolio/{s.id}'})

@role_required('Student')
def alumni(request):
    if request.method=='GET': return json_response({'alumni':[{'id':str(x.id),'name':x.name,'graduationYear':x.graduation_year,'department':x.department,'company':x.company,'designation':x.designation,'bio':x.bio,'skills':x.skills,'referrals':x.referrals} for x in AlumniProfile.objects.filter(is_public=True)]})
    if request.method=='POST':
        data=body(request) or {}; aid=data.get('alumniId');
        try: a=AlumniProfile.objects.get(id=aid,is_public=True)
        except AlumniProfile.DoesNotExist: return json_response({'detail':'Alumni not found.'},404)
        s=StudentProfile.objects.get(user=request.api_user); r=MentorshipRequest.objects.create(id=db.sid(),student=s,alumni=a,message=str(data.get('message',''))); return json_response({'id':str(r.id),'status':r.status},201)
    return json_response({'detail':'Method not allowed.'},405)

@role_required('Student')
def achievements(request):
    if request.method=='GET': return json_response({'achievements':[{'id':str(a.id),'student':a.student.full_name,'title':a.title,'description':a.description,'company':a.company,'package':a.package,'date':a.achieved_at.isoformat() if a.achieved_at else None} for a in Achievement.objects.filter(is_public=True).select_related('student')[:100]]})
    if request.method=='POST':
        data=body(request) or {}; s=StudentProfile.objects.get(user=request.api_user); a=Achievement.objects.create(id=db.sid(),student=s,title=str(data.get('title','Achievement')),description=str(data.get('description','')),company=str(data.get('company','')),package=str(data.get('package',''))); return json_response({'id':str(a.id)},201)
    return json_response({'detail':'Method not allowed.'},405)

@csrf_exempt
@role_required('Placement')
def bulk_notify(request):
    if request.method!='POST': return json_response({'detail':'Method not allowed.'},405)
    data=body(request) or {}; audience=data.get('audience') or {}; users=UserAccount.objects.filter(is_active=True)
    if audience.get('role'): users=users.filter(role=audience['role'])
    count=users.count(); sent=0
    for u in users:
        Notification.objects.create(id=db.sid(),user=u,title=str(data.get('subject','Placement Announcement')),message=str(data.get('message','')))
        if send_email_or_debug(str(data.get('subject','Placement Announcement')),str(data.get('message','')),u.email): sent+=1
    b=BulkNotification.objects.create(id=db.sid(),sender=request.api_user,audience=audience,subject=str(data.get('subject','')),message=str(data.get('message','')),recipient_count=count,email_sent_count=sent)
    return json_response({'recipientCount':count,'inAppSent':count,'emailSentCount':sent,'id':str(b.id)})

@role_required('Admin')
def database_health(request):
    from django.db import connection
    with connection.cursor() as cur:
        cur.execute('SELECT VERSION()'); version=cur.fetchone()[0]
    tables=connection.introspection.table_names()
    return json_response({'database':'MySQL','version':version,'tables':len(tables),'storage':'Available','healthy':True})

@csrf_exempt
@role_required('Admin')
def database_backup(request):
    if request.method!='POST': return json_response({'detail':'Method not allowed.'},405)
    import os, subprocess, pathlib, datetime as dt
    dbcfg=settings.DATABASES['default']; outdir=settings.BASE_DIR/'backups'; outdir.mkdir(exist_ok=True); path=outdir/f"portal_{dt.datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    cmd=['mysqldump','-h',str(dbcfg['HOST']),'-P',str(dbcfg['PORT']),'-u',str(dbcfg['USER']),f"--password={dbcfg['PASSWORD']}",str(dbcfg['NAME'])]
    try:
        with open(path,'wb') as f: subprocess.run(cmd,stdout=f,stderr=subprocess.PIPE,check=True,timeout=120)
        return json_response({'backupCreated':True,'file':str(path.name),'size':path.stat().st_size})
    except Exception as exc:
        return json_response({'backupCreated':False,'detail':f'mysqldump unavailable or failed: {exc}'},500)
