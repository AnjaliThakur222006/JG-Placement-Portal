import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import type { jsPDF as JsPdfDocument } from 'jspdf';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <header class="d-flex align-items-center justify-content-between gap-3 mb-4 report-header">
        <div>
          <h2 class="fw-bold mb-1">Portal Reports</h2>
          <div class="text-secondary">Generated {{ generatedAt }}</div>
        </div>
        <button class="btn btn-dark report-action" type="button" (click)="downloadPdf()">
          <i class="bi bi-file-earmark-pdf me-2"></i>Download PDF
        </button>
      </header>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Placement overview</h3>
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead><tr><th scope="col">Measure</th><th scope="col" class="text-end">Total</th></tr></thead>
            <tbody>
              <tr *ngFor="let metric of metrics">
                <th scope="row" class="fw-medium">{{ metric.label }}</th>
                <td class="text-end fw-bold">{{ metric.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Student profiles</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Name</th><th>Department</th><th>CGPA</th><th>Graduation</th><th>Skills</th></tr></thead>
          <tbody><tr *ngFor="let student of students"><td>{{ student.fullName }}</td><td>{{ student.department }}</td><td>{{ student.academic.cgpa }}</td><td>{{ student.academic.graduationYear }}</td><td>{{ student.skills.slice(0, 3).map(skill => skill.name).join(', ') }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Company profiles</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Company</th><th>Industry</th><th>Location</th><th>Website</th><th>Verification</th></tr></thead>
          <tbody><tr *ngFor="let company of companies"><td>{{ company.name }}</td><td>{{ company.industry }}</td><td>{{ company.location }}</td><td>{{ company.website || 'Not provided' }}</td><td>{{ company.isVerified ? 'Verified' : 'Pending' }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Company jobs</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Role</th><th>Company</th><th>Location</th><th>Type</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let job of jobs"><td>{{ job.title }}</td><td>{{ companyName(job.companyId) }}</td><td>{{ job.location }}</td><td>{{ job.type }}</td><td>{{ job.status }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Applications</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Student</th><th>Role</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let application of applications"><td>{{ studentName(application.studentId) }}</td><td>{{ jobTitle(application.jobId) }}</td><td>{{ companyName(application.companyId) }}</td><td>{{ application.appliedDate | date:'mediumDate' }}</td><td>{{ application.status }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Interview schedule</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Student</th><th>Role</th><th>Date</th><th>Time</th><th>Mode</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let interview of interviews"><td>{{ studentName(interview.studentId) }}</td><td>{{ jobTitle(interview.jobId) }}</td><td>{{ interview.date | date:'mediumDate' }}</td><td>{{ interview.time }}</td><td>{{ interview.mode }}</td><td>{{ interview.status }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Offers</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Student</th><th>Role</th><th>Company</th><th>Package</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let offer of offers"><td>{{ studentName(offer.studentId) }}</td><td>{{ jobTitle(offer.jobId) }}</td><td>{{ companyName(offer.companyId) }}</td><td>{{ offer.salary }}</td><td>{{ offer.status }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Placement drives</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Drive</th><th>Company</th><th>Date</th><th>Venue</th><th>Eligibility</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let drive of drives"><td>{{ drive.name }}</td><td>{{ drive.company }}</td><td>{{ drive.date | date:'mediumDate' }}</td><td>{{ drive.venue }}</td><td>{{ drive.eligibility }}</td><td>{{ drive.status }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Certificates</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Student</th><th>Certificate</th><th>Issuer</th><th>Date</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let certificate of certificates"><td>{{ studentName(certificate.studentId || '') }}</td><td>{{ certificate.name }}</td><td>{{ certificate.issuingOrganization }}</td><td>{{ certificate.date | date:'mediumDate' }}</td><td>{{ certificate.status }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Support tickets</h3>
        <div class="table-responsive"><table class="table align-middle mb-0">
          <thead><tr><th>Raised by</th><th>Subject</th><th>Details</th><th>Status</th></tr></thead>
          <tbody><tr *ngFor="let ticket of tickets"><td>{{ userName(ticket.raisedBy) }}</td><td>{{ ticket.subject }}</td><td>{{ ticket.message }}</td><td>{{ ticket.status }}</td></tr></tbody>
        </table></div>
      </section>

      <section class="card border-0 shadow-sm p-4">
        <h3 class="h5 fw-bold mb-3">Placement announcements</h3>
        <div *ngIf="recentNotifications.length === 0" class="text-secondary">No announcements are available.</div>
        <div *ngIf="recentNotifications.length > 0" class="table-responsive">
          <table class="table align-middle mb-0">
            <thead><tr><th>When</th><th>Announcement</th><th>Message</th></tr></thead>
            <tbody><tr *ngFor="let notification of recentNotifications"><td>{{ notification.createdAt | date:'mediumDate' }}</td><td>{{ notification.title }}</td><td>{{ notification.message }}</td></tr></tbody>
          </table>
        </div>
      </section>

      <section class="card border-0 shadow-sm p-4 mb-4">
        <h3 class="h5 fw-bold mb-3">Recent audit activity</h3>
        <div *ngIf="recentAuditLogs.length === 0" class="text-secondary">No audit activity is available.</div>
        <div *ngIf="recentAuditLogs.length > 0" class="table-responsive">
          <table class="table align-middle mb-0">
            <thead><tr><th scope="col">When</th><th scope="col">User</th><th scope="col">Action</th></tr></thead>
            <tbody>
              <tr *ngFor="let log of recentAuditLogs">
                <td>{{ log.createdAt | date:'medium' }}</td><td>{{ log.user }}</td><td>{{ log.action }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .container-fluid { min-height: 100vh; background: #f8fafc; }
    .card { border-radius: 8px; }
    @media print {
      .container-fluid { min-height: 0; padding: 0 !important; background: #fff !important; }
      .report-action { display: none !important; }
      :host ::ng-deep .admin-sidebar { display: none !important; }
      :host ::ng-deep .admin-content { margin: 0 !important; width: 100% !important; }
      .card { box-shadow: none !important; break-inside: avoid; }
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  generatedAt = '';
  metrics: { label: string; value: string | number }[] = [];
  recentAuditLogs: ReturnType<DataService['getAuditLogs']> = [];
  students: ReturnType<DataService['getStudents']> = [];
  companies: ReturnType<DataService['getCompanies']> = [];
  jobs: ReturnType<DataService['getJobs']> = [];
  applications: ReturnType<DataService['getApplications']> = [];
  interviews: ReturnType<DataService['getInterviews']> = [];
  offers: ReturnType<DataService['getOffers']> = [];
  drives: ReturnType<DataService['getPlacementDrives']> = [];
  certificates: ReturnType<DataService['getCertificates']> = [];
  tickets: ReturnType<DataService['getTickets']> = [];
  recentNotifications: ReturnType<DataService['getNotifications']> = [];

  constructor(private data: DataService) {}

  ngOnInit(): void {
    const state = this.data.getState();
    this.students = state.students;
    this.companies = state.companies;
    this.jobs = state.jobs;
    this.applications = state.applications;
    this.interviews = state.interviews;
    this.offers = state.offers;
    this.drives = state.placementDrives;
    this.certificates = state.certificates;
    this.tickets = state.tickets;
    this.recentNotifications = [...state.notifications]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 10);
    const selectedStudentIds = new Set([
      ...state.applications.filter((application) => application.status === 'Selected').map((application) => application.studentId),
      ...state.offers.filter((offer) => offer.status === 'Accepted').map((offer) => offer.studentId)
    ]);
    const resumeScores = state.students.map((student) => student.resume?.score).filter((score): score is number => typeof score === 'number');
    const averageResumeScore = resumeScores.length
      ? Math.round(resumeScores.reduce((total, score) => total + score, 0) / resumeScores.length)
      : 0;

    this.generatedAt = new Date().toLocaleString();
    this.metrics = [
      { label: 'Registered users', value: state.users.length },
      { label: 'Student profiles', value: state.students.length },
      { label: 'Verified companies', value: state.companies.filter((company) => company.isVerified).length },
      { label: 'Approved jobs', value: state.jobs.filter((job) => job.status === 'Approved').length },
      { label: 'Shortlisted applications', value: state.applications.filter((application) => application.status === 'Shortlisted').length },
      { label: 'Applications', value: state.applications.length },
      { label: 'Interviews', value: state.interviews.length },
      { label: 'Offers', value: state.offers.length },
      { label: 'Students placed', value: selectedStudentIds.size },
      { label: 'Placement drives', value: state.placementDrives.length },
      { label: 'Certificates', value: state.certificates.length },
      { label: 'Average AI resume score', value: `${averageResumeScore}% (${resumeScores.length} scored resumes)` },
      { label: 'Open support tickets', value: state.tickets.filter((ticket) => !['resolved', 'closed'].includes(ticket.status.toLowerCase())).length }
    ];
    this.recentAuditLogs = [...state.auditLogs].sort((left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    ).slice(0, 10);
  }

  studentName(id: string): string {
    return this.students.find((student) => student.id === id)?.fullName || 'Student';
  }

  jobTitle(id: string): string {
    return this.jobs.find((job) => job.id === id)?.title || 'Role';
  }

  companyName(id: string): string {
    return this.companies.find((company) => company.id === id)?.name || 'Company';
  }

  userName(id: string): string {
    return this.data.getUsers().find((user) => user.id === id)?.name || id;
  }

  async downloadPdf(): Promise<void> {
    const [{ jsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    const document = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    document.setFontSize(18);
    document.text('JG UNIVERSITY | PLACEMENT REPORT', 14, 18);
    document.setFontSize(9);
    document.text(`Generated ${this.generatedAt}`, 14, 25);

    let startY = 32;
    const addTable = (title: string, columns: string[], rows: (string | number)[][]): void => {
      if (startY > 255) {
        document.addPage();
        startY = 18;
      }
      document.setFontSize(12);
      document.text(title, 14, startY);
      autoTable(document, {
        startY: startY + 3,
        head: [columns],
        body: rows.length ? rows : [['No records available']],
        styles: { fontSize: 8, cellPadding: 2.2 },
        headStyles: { fillColor: [153, 27, 27] },
        margin: { left: 14, right: 14 }
      });
      startY = (document as JsPdfDocument & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    };

    addTable('Placement overview', ['Measure', 'Total'], this.metrics.map((metric) => [metric.label, metric.value]));
    addTable('Student profiles', ['Name', 'Department', 'CGPA', 'Graduation', 'Skills'], this.students.map((student) => [
      student.fullName, student.department, student.academic.cgpa, student.academic.graduationYear,
      student.skills.slice(0, 3).map((skill) => skill.name).join(', ')
    ]));
    addTable('Company profiles', ['Company', 'Industry', 'Location', 'Website', 'Verification'], this.companies.map((company) => [
      company.name, company.industry, company.location, company.website || 'Not provided', company.isVerified ? 'Verified' : 'Pending'
    ]));
    addTable('Company jobs', ['Role', 'Company', 'Location', 'Type', 'Status'], this.jobs.map((job) => [
      job.title, this.companyName(job.companyId), job.location, job.type, job.status
    ]));
    addTable('Applications', ['Student', 'Role', 'Company', 'Applied', 'Status'], this.applications.map((application) => [
      this.studentName(application.studentId), this.jobTitle(application.jobId), this.companyName(application.companyId), application.appliedDate, application.status
    ]));
    addTable('Interview schedule', ['Student', 'Role', 'Date', 'Time', 'Mode', 'Status'], this.interviews.map((interview) => [
      this.studentName(interview.studentId), this.jobTitle(interview.jobId), interview.date, interview.time, interview.mode, interview.status
    ]));
    addTable('Offers', ['Student', 'Role', 'Company', 'Package', 'Status'], this.offers.map((offer) => [
      this.studentName(offer.studentId), this.jobTitle(offer.jobId), this.companyName(offer.companyId), offer.salary, offer.status
    ]));
    addTable('Placement drives', ['Drive', 'Company', 'Date', 'Venue', 'Eligibility', 'Status'], this.drives.map((drive) => [
      drive.name, drive.company, drive.date, drive.venue, drive.eligibility, drive.status
    ]));
    addTable('Certificates', ['Student', 'Certificate', 'Issuer', 'Date', 'Status'], this.certificates.map((certificate) => [
      this.studentName(certificate.studentId || ''), certificate.name, certificate.issuingOrganization, certificate.date, certificate.status || 'Pending'
    ]));
    addTable('Support tickets', ['Raised by', 'Subject', 'Details', 'Status'], this.tickets.map((ticket) => [
      this.userName(ticket.raisedBy), ticket.subject, ticket.message, ticket.status
    ]));
    addTable('Placement announcements', ['When', 'Announcement', 'Message'], this.recentNotifications.map((notification) => [
      new Date(notification.createdAt).toLocaleDateString(), notification.title, notification.message
    ]));
    addTable('Recent audit activity', ['When', 'User', 'Action'], this.recentAuditLogs.map((log) => [
      new Date(log.createdAt).toLocaleString(), log.user, log.action
    ]));
    document.save(`jg-placement-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}