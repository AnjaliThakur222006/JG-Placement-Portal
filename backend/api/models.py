from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=120, unique=True)
    head = models.CharField(max_length=120, blank=True)

    class Meta:
        db_table = "departments"
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserAccount(models.Model):
    ROLE_CHOICES = [("Student","Student"),("Company","Company"),("Placement","Placement"),("Admin","Admin")]
    id = models.UUIDField(primary_key=True, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email


class StudentProfile(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, related_name="student_profile")
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    enrollment_number = models.CharField(max_length=80, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name="students")
    semester = models.CharField(max_length=30, blank=True)
    mobile = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=150, blank=True)
    about = models.TextField(blank=True)
    career_objective = models.TextField(blank=True)
    linked_in = models.URLField(blank=True)
    git_hub = models.URLField(blank=True)
    portfolio = models.URLField(blank=True)
    profile_image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "student_profiles"


class AcademicRecord(models.Model):
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name="academic")
    course = models.CharField(max_length=120, blank=True)
    semester = models.CharField(max_length=30, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    twelfth_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    backlogs = models.PositiveIntegerField(default=0)
    graduation_year = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "academic_records"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "skills"


class StudentSkill(models.Model):
    PROFICIENCY = [("Beginner","Beginner"),("Intermediate","Intermediate"),("Advanced","Advanced")]
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="student_skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="student_links")
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY, default="Beginner")

    class Meta:
        db_table = "student_skills"
        constraints = [models.UniqueConstraint(fields=["student","skill"], name="uniq_student_skill")]


class Resume(models.Model):
    STATUS = [("Uploaded","Uploaded"),("Flagged","Flagged"),("Verified","Verified")]
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.OneToOneField(StudentProfile, on_delete=models.CASCADE, related_name="resume")
    file = models.FileField(upload_to="resumes/")
    file_name = models.CharField(max_length=255)
    sha256 = models.CharField(max_length=64, db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS, default="Uploaded")
    score = models.PositiveIntegerField(default=0)
    parsed_data = models.JSONField(default=dict, blank=True)
    suggestions = models.JSONField(default=list, blank=True)

    class Meta:
        db_table = "resumes"


class Certificate(models.Model):
    STATUS = [("Pending","Pending"),("Verified","Verified"),("Rejected","Rejected"),("Flagged","Flagged")]
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="certificates")
    name = models.CharField(max_length=180)
    issuing_organization = models.CharField(max_length=180)
    date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=150, blank=True)
    credential_link = models.URLField(blank=True)
    file = models.FileField(upload_to="certificates/", blank=True)
    sha256 = models.CharField(max_length=64, blank=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "certificates"


class Company(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user = models.OneToOneField(UserAccount, on_delete=models.CASCADE, related_name="company_profile")
    name = models.CharField(max_length=180)
    logo = models.URLField(blank=True)
    industry = models.CharField(max_length=120, blank=True)
    location = models.CharField(max_length=150, blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    hr_name = models.CharField(max_length=120, blank=True)
    hr_email = models.EmailField(blank=True)
    hr_phone = models.CharField(max_length=30, blank=True)
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "companies"


class CompanyHR(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="hr_members")
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "company_hr"


class Job(models.Model):
    STATUS = [("Pending","Pending"),("Approved","Approved"),("Rejected","Rejected"),("Closed","Closed")]
    id = models.UUIDField(primary_key=True, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)
    type = models.CharField(max_length=60, blank=True)
    salary = models.CharField(max_length=100, blank=True)
    minimum_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    eligible_departments = models.JSONField(default=list, blank=True)
    deadline = models.DateField(null=True, blank=True)
    vacancies = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "jobs"


class JobSkill(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="job_skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="job_links")

    class Meta:
        db_table = "job_skills"
        constraints = [models.UniqueConstraint(fields=["job","skill"], name="uniq_job_skill")]


class Application(models.Model):
    STATUS = [("Applied","Applied"),("Under Review","Under Review"),("Shortlisted","Shortlisted"),("Interview Scheduled","Interview Scheduled"),("Selected","Selected"),("Rejected","Rejected")]
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="applications")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="applications")
    applied_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=STATUS, default="Applied")

    class Meta:
        db_table = "applications"
        constraints = [models.UniqueConstraint(fields=["student","job"], name="uniq_student_job_application")]


class Interview(models.Model):
    STATUS = [("Scheduled","Scheduled"),("Completed","Completed"),("Cancelled","Cancelled")]
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="interviews")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="interviews")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="interviews")
    date = models.DateField()
    time = models.TimeField()
    mode = models.CharField(max_length=60, blank=True)
    location = models.CharField(max_length=180, blank=True)
    interviewer = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="Scheduled")

    class Meta:
        db_table = "interviews"


class Offer(models.Model):
    STATUS = [("Pending","Pending"),("Accepted","Accepted"),("Declined","Declined")]
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="offers")
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="offers")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="offers")
    salary = models.CharField(max_length=100, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    offer_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="Pending")

    class Meta:
        db_table = "offers"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=180)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        db_table = "notifications"


class PlacementDrive(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    name = models.CharField(max_length=180)
    company = models.CharField(max_length=180)
    date = models.DateField(null=True, blank=True)
    venue = models.CharField(max_length=180, blank=True)
    eligibility = models.TextField(blank=True)
    status = models.CharField(max_length=60, default="Upcoming")

    class Meta:
        db_table = "placement_drives"


class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    raised_by = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="tickets")
    subject = models.CharField(max_length=180)
    message = models.TextField()
    status = models.CharField(max_length=60, default="Open")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tickets"


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    user = models.CharField(max_length=150)
    action = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]


class LoginHistory(models.Model):
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="login_history")
    login_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    success = models.BooleanField(default=True)

    class Meta:
        db_table = "login_history"
        ordering = ["-login_at"]


class AIAnalysis(models.Model):
    ANALYSIS_TYPES = [("resume","resume"),("match","match"),("skill_gap","skill_gap"),("readiness","readiness"),("certificate","certificate")]
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="ai_analyses")
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True, related_name="ai_analyses")
    analysis_type = models.CharField(max_length=30, choices=ANALYSIS_TYPES)
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    result = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_analyses"


class SystemSetting(models.Model):
    key = models.CharField(max_length=120, unique=True)
    value = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "system_settings"

class EmailOTP(models.Model):
    PURPOSES = [("verify","verify"),("reset","reset")]
    id = models.UUIDField(primary_key=True, editable=False)
    user = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="otps")
    purpose = models.CharField(max_length=20, choices=PURPOSES)
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "email_otps"

class MockTestQuestion(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    category = models.CharField(max_length=80, default="Aptitude")
    question = models.TextField()
    options = models.JSONField(default=list)
    answer = models.PositiveIntegerField(default=0)
    explanation = models.TextField(blank=True)
    difficulty = models.CharField(max_length=30, default="Medium")
    class Meta:
        db_table = "mock_test_questions"

class MockTestAttempt(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="mock_tests")
    score = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)
    answers = models.JSONField(default=dict)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = "mock_test_attempts"

class MockInterviewAttempt(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="mock_interviews")
    questions = models.JSONField(default=list)
    answers = models.JSONField(default=dict)
    score = models.PositiveIntegerField(default=0)
    feedback = models.JSONField(default=list)
    completed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "mock_interview_attempts"

class AlumniProfile(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    graduation_year = models.PositiveIntegerField(default=0)
    department = models.CharField(max_length=120, blank=True)
    company = models.CharField(max_length=180, blank=True)
    designation = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list)
    referrals = models.JSONField(default=list)
    is_public = models.BooleanField(default=True)
    class Meta:
        db_table = "alumni_profiles"

class MentorshipRequest(models.Model):
    STATUS = [("Pending","Pending"),("Accepted","Accepted"),("Rejected","Rejected")]
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="mentorship_requests")
    alumni = models.ForeignKey(AlumniProfile, on_delete=models.CASCADE, related_name="mentorship_requests")
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "mentorship_requests"

class Achievement(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="achievements")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    company = models.CharField(max_length=180, blank=True)
    package = models.CharField(max_length=100, blank=True)
    achieved_at = models.DateField(null=True, blank=True)
    is_public = models.BooleanField(default=True)
    class Meta:
        db_table = "achievements"

class BulkNotification(models.Model):
    id = models.UUIDField(primary_key=True, editable=False)
    sender = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="bulk_notifications")
    audience = models.JSONField(default=dict)
    subject = models.CharField(max_length=180)
    message = models.TextField()
    recipient_count = models.PositiveIntegerField(default=0)
    email_sent_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "bulk_notifications"
