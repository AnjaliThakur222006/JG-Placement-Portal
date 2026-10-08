import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-interviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p class="text-muted mb-1">Interview scheduling</p>
          <h2 class="fw-bold mb-0">Interview Panel</h2>
        </div>
      </div>
      <div class="row g-4">
        <div class="col-md-6 col-xl-4" *ngFor="let interview of interviews">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div class="fw-bold fs-5 mb-2">{{ studentLookup[interview.studentId]?.fullName || 'Candidate' }}</div>
            <div class="text-muted mb-2">{{ jobLookup[interview.jobId]?.title || 'Role' }}</div>
            <div class="small text-secondary mb-1"><i class="bi bi-calendar3 me-2"></i>{{ interview.date }}</div>
            <div class="small text-secondary mb-1"><i class="bi bi-clock me-2"></i>{{ interview.time }}</div>
            <div class="small text-secondary mb-3"><i class="bi bi-geo-alt me-2"></i>{{ interview.location }}</div>
            <span class="badge bg-warning-subtle text-warning rounded-pill px-3 py-2">{{ interview.status }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class CompanyInterviewsComponent implements OnInit {
  interviews: any[] = [];
  studentLookup: Record<string, any> = {};
  jobLookup: Record<string, any> = {};
  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    const company = this.data.getCompanies().find((c) => c.userId === user?.id);
    this.interviews = this.data.getInterviews().filter((item) => item.companyId === company?.id);
    this.studentLookup = Object.fromEntries(this.data.getStudents().map((student) => [student.id, student]));
    this.jobLookup = Object.fromEntries(this.data.getJobs().map((job) => [job.id, job]));
  }
}
