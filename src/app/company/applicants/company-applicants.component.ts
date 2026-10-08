import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-applicants',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p class="text-muted mb-1">Talent pipeline</p>
          <h2 class="fw-bold mb-0">Applicants</h2>
        </div>
      </div>
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr><th>Student</th><th>Role</th><th>Department</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let app of applicants">
                <td>{{ studentLookup[app.studentId]?.fullName || 'Student' }}</td>
                <td>{{ jobLookup[app.jobId]?.title || 'Role' }}</td>
                <td>{{ studentLookup[app.studentId]?.department || '-' }}</td>
                <td><span class="badge rounded-pill" [ngClass]="statusClass(app.status)">{{ app.status }}</span></td>
                <td><button class="btn btn-sm btn-outline-danger" (click)="review(app)">Review</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class CompanyApplicantsComponent implements OnInit {
  applicants: any[] = [];
  studentLookup: Record<string, any> = {};
  jobLookup: Record<string, any> = {};

  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    const company = this.data.getCompanies().find((c) => c.userId === user?.id);
    this.applicants = this.data.getApplications().filter((app) => app.companyId === company?.id);
    this.studentLookup = Object.fromEntries(this.data.getStudents().map((student) => [student.id, student]));
    this.jobLookup = Object.fromEntries(this.data.getJobs().map((job) => [job.id, job]));
  }

  review(app: any): void {
    const next: Record<string,string> = { 'Applied': 'Shortlisted', 'Under Review': 'Shortlisted', 'Shortlisted': 'Rejected', 'Rejected': 'Shortlisted' };
    const state = this.data.getState();
    const item = state.applications.find((x: any) => x.id === app.id);
    if (item) { item.status = (next[item.status] || 'Under Review') as any; this.data.setState(state); app.status = item.status; }
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Shortlisted': return 'bg-success-subtle text-success';
      case 'Rejected': return 'bg-danger-subtle text-danger';
      default: return 'bg-warning-subtle text-warning';
    }
  }
}
