import MySQLdb
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection
from api.models import (
    Department, UserAccount, StudentProfile, AcademicRecord, Skill, StudentSkill, Resume, Certificate,
    Company, CompanyHR, Job, JobSkill, Application, Interview, Offer, Notification, PlacementDrive,
    Ticket, AuditLog, LoginHistory, AIAnalysis, SystemSetting, EmailOTP, MockTestQuestion, MockTestAttempt, MockInterviewAttempt, AlumniProfile, MentorshipRequest, Achievement, BulkNotification
)

MODELS = [
    Department, UserAccount, StudentProfile, AcademicRecord, Skill, StudentSkill, Resume, Certificate,
    Company, CompanyHR, Job, JobSkill, Application, Interview, Offer, Notification, PlacementDrive,
    Ticket, AuditLog, LoginHistory, AIAnalysis, SystemSetting, EmailOTP, MockTestQuestion, MockTestAttempt, MockInterviewAttempt, AlumniProfile, MentorshipRequest, Achievement, BulkNotification
]

class Command(BaseCommand):
    help = "Create the MySQL database (if needed), create portal tables, and seed demo data."

    def handle(self, *args, **options):
        db = settings.DATABASES["default"]
        conn = MySQLdb.connect(host=db["HOST"], port=int(db["PORT"]), user=db["USER"], passwd=db["PASSWORD"])
        cur = conn.cursor()
        cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db['NAME']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        conn.commit()
        cur.close()
        conn.close()

        existing = set(connection.introspection.table_names())
        with connection.schema_editor() as schema_editor:
            for model in MODELS:
                if model._meta.db_table not in existing:
                    schema_editor.create_model(model)
                    self.stdout.write(self.style.SUCCESS(f"Created table: {model._meta.db_table}"))
        from api.db_service import seed_data
        seed_data()
        self.stdout.write(self.style.SUCCESS("JG Placement Portal MySQL database is ready."))
