import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LandingPageComponent } from './landing/landing-page/landing-page.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { StudentDashboardComponent } from './student/dashboard/student-dashboard.component';
import { StudentProfileComponent } from './student/profile/student-profile.component';
import { StudentAcademicComponent } from './student/academic/student-academic.component';
import { StudentSkillsComponent } from './student/skills/student-skills.component';
import { StudentResumeComponent } from './student/resume/student-resume.component';
import { StudentCertificatesComponent } from './student/certificates/student-certificates.component';
import { StudentJobsComponent } from './student/jobs/student-jobs.component';
import { StudentApplicationsComponent } from './student/applications/student-applications.component';
import { StudentInterviewsComponent } from './student/interviews/student-interviews.component';
import { StudentSkillGapComponent } from './student/skill-gap/student-skill-gap.component';
import { StudentNotificationsComponent } from './student/notifications/student-notifications.component';
import { StudentSettingsComponent } from './student/settings/student-settings.component';
import { CompanyDashboardComponent } from './company/dashboard/company-dashboard.component';
import { CompanyProfileComponent } from './company/profile/company-profile.component';
import { CompanyJobsComponent } from './company/jobs/company-jobs.component';
import { CompanyApplicantsComponent } from './company/applicants/company-applicants.component';
import { CompanyInterviewsComponent } from './company/interviews/company-interviews.component';
import { CompanyOffersComponent } from './company/offers/company-offers.component';
import { CompanyReportsComponent } from './company/reports/company-reports.component';
import { CompanyNotificationsComponent } from './company/notifications/company-notifications.component';
import { CompanySettingsComponent } from './company/settings/company-settings.component';
import { CompanyLayoutComponent } from './company/layout/company-layout.component';
import { PlacementDashboardComponent } from './placement/dashboard/placement-dashboard.component';
import { PlacementStudentsComponent } from './placement/students/placement-students.component';
import { PlacementCompaniesComponent } from './placement/companies/placement-companies.component';
import { PlacementJobsComponent } from './placement/jobs/placement-jobs.component';
import { PlacementDrivesComponent } from './placement/drives/placement-drives.component';
import { PlacementApplicationsComponent } from './placement/applications/placement-applications.component';
import { PlacementInterviewsComponent } from './placement/interviews/placement-interviews.component';
import { PlacementReportsComponent } from './placement/reports/placement-reports.component';
import { PlacementNotificationsComponent } from './placement/notifications/placement-notifications.component';
import { PlacementTicketsComponent } from './placement/tickets/placement-tickets.component';
import { PlacementSettingsComponent } from './placement/settings/placement-settings.component';
import { PlacementLayoutComponent } from './placement/layout/placement-layout.component';
import { AdminDashboardComponent } from './admin/dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin/users/admin-users.component';
import { AdminStudentsComponent } from './admin/students/admin-students.component';
import { AdminCompaniesComponent } from './admin/companies/admin-companies.component';
import { AdminRolesComponent } from './admin/roles/admin-roles.component';
import { AdminDepartmentsComponent } from './admin/departments/admin-departments.component';
import { AdminAuditLogsComponent } from './admin/audit-logs/admin-audit-logs.component';
import { AdminReportsComponent } from './admin/reports/admin-reports.component';
import { AdminAiSettingsComponent } from './admin/ai-settings/admin-ai-settings.component';
import { AdminBackupComponent } from './admin/backup/admin-backup.component';
import { AdminNotificationsComponent } from './admin/notifications/admin-notifications.component';
import { AdminSettingsComponent } from './admin/settings/admin-settings.component';
import { AdminLayoutComponent } from './admin/layout/admin-layout.component';
import { SrsFeaturesComponent } from './features/srs-features.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  {
    path: 'student',
    canActivate: [authGuard],
    data: { role: 'Student' },
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'profile', component: StudentProfileComponent },
      { path: 'academic', component: StudentAcademicComponent },
      { path: 'skills', component: StudentSkillsComponent },
      { path: 'resume', component: StudentResumeComponent },
      { path: 'certificates', component: StudentCertificatesComponent },
      { path: 'jobs', component: StudentJobsComponent },
      { path: 'applications', component: StudentApplicationsComponent },
      { path: 'interviews', component: StudentInterviewsComponent },
      { path: 'skill-gap', component: StudentSkillGapComponent },
      { path: 'notifications', component: StudentNotificationsComponent },
      { path: 'settings', component: StudentSettingsComponent },
      { path: 'mock-test', component: SrsFeaturesComponent, data: { mode: 'mockTest' } },
      { path: 'mock-interview', component: SrsFeaturesComponent, data: { mode: 'mockInterview' } },
      { path: 'portfolio', component: SrsFeaturesComponent, data: { mode: 'portfolio' } },
      { path: 'alumni', component: SrsFeaturesComponent, data: { mode: 'alumni' } },
      { path: 'achievements', component: SrsFeaturesComponent, data: { mode: 'achievements' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'company',
    component: CompanyLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'Company' },
    children: [
      { path: 'dashboard', component: CompanyDashboardComponent },
      { path: 'profile', component: CompanyProfileComponent },
      { path: 'jobs', component: CompanyJobsComponent },
      { path: 'applicants', component: CompanyApplicantsComponent },
      { path: 'interviews', component: CompanyInterviewsComponent },
      { path: 'offers', component: CompanyOffersComponent },
      { path: 'reports', component: CompanyReportsComponent },
      { path: 'notifications', component: CompanyNotificationsComponent },
      { path: 'settings', component: CompanySettingsComponent },
      { path: 'ranking', component: SrsFeaturesComponent, data: { mode: 'ranking' } },
      { path: 'ai-ranking', component: SrsFeaturesComponent, data: { mode: 'ranking' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'placement',
    component: PlacementLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'Placement' },
    children: [
      { path: 'dashboard', component: PlacementDashboardComponent },
      { path: 'students', component: PlacementStudentsComponent },
      { path: 'companies', component: PlacementCompaniesComponent },
      { path: 'jobs', component: PlacementJobsComponent },
      { path: 'drives', component: PlacementDrivesComponent },
      { path: 'applications', component: PlacementApplicationsComponent },
      { path: 'interviews', component: PlacementInterviewsComponent },
      { path: 'reports', component: PlacementReportsComponent },
      { path: 'notifications', component: PlacementNotificationsComponent },
      { path: 'tickets', component: PlacementTicketsComponent },
      { path: 'settings', component: PlacementSettingsComponent },
      { path: 'verification', component: SrsFeaturesComponent, data: { mode: 'verification' } },
      { path: 'bulk-notifications', component: SrsFeaturesComponent, data: { mode: 'bulk' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'Admin' },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'students', component: AdminStudentsComponent },
      { path: 'companies', component: AdminCompaniesComponent },
      { path: 'roles', component: AdminRolesComponent },
      { path: 'departments', component: AdminDepartmentsComponent },
      { path: 'audit-logs', component: AdminAuditLogsComponent },
      { path: 'reports', component: AdminReportsComponent },
      { path: 'ai-settings', component: AdminAiSettingsComponent },
      { path: 'backup', component: AdminBackupComponent },
      { path: 'notifications', component: AdminNotificationsComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'database-health', component: SrsFeaturesComponent, data: { mode: 'health' } },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];
