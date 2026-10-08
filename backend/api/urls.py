from django.urls import path, re_path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("auth/login/", views.login_view),
    path("auth/register/", views.register_view),
    path("auth/logout/", views.logout_view),
    path("state/", views.state_view),
    path("ai/skill-gap/", views.ai_skill_gap),
    path("ai/readiness/", views.ai_readiness),
    path("ai/job-match/<uuid:job_id>/", views.ai_job_match),
    path("student/resume/upload/", views.resume_upload),
    path("student/resume/", views.resume_delete),
    re_path(r"^(?P<resource>users|students|companies|jobs|applications|interviews|offers|certificates|notifications|placementDrives|tickets|auditLogs|departments)/$", views.resource_collection),
    re_path(r"^(?P<resource>users|students|companies|jobs|applications|interviews|offers|certificates|notifications|placementDrives|tickets|auditLogs|departments)/(?P<item_id>[^/]+)/$", views.resource_item),
]
urlpatterns += [
    path('auth/request-otp/', views.request_otp),
    path('auth/verify-otp/', views.verify_otp),
    path('auth/reset-password/', views.reset_password),
    path('student/certificate/upload/', views.certificate_upload),
    path('student/mock-test/', views.mock_test),
    path('student/mock-interview/', views.mock_interview),
    path('student/portfolio/', views.portfolio_view),
    path('student/alumni/', views.alumni),
    path('student/achievements/', views.achievements),
    path('placement/bulk-notify/', views.bulk_notify),
    path('verify/<str:record_type>/<uuid:record_id>/', views.verify_record),
    path('company/jobs/<uuid:job_id>/ranking/', views.candidate_ranking),
    path('company/applications/<uuid:application_id>/feedback/', views.candidate_feedback),
    path('admin/database-health/', views.database_health),
    path('admin/database-backup/', views.database_backup),
]
