import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="mb-4">
        <p class="text-muted mb-1">Analytics</p>
        <h2 class="fw-bold mb-0">Recruitment Reports</h2>
      </div>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white"><div class="text-muted">Applicants</div><div class="display-6 fw-bold text-danger">{{ stats.applicants }}</div></div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white"><div class="text-muted">Shortlisted</div><div class="display-6 fw-bold text-success">{{ stats.shortlisted }}</div></div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white"><div class="text-muted">Offers</div><div class="display-6 fw-bold text-primary">{{ stats.offers }}</div></div>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class CompanyReportsComponent implements OnInit {
  stats = { applicants: 0, shortlisted: 0, offers: 0 };
  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    const company = this.data.getCompanies().find((c) => c.userId === user?.id);
    const applications = this.data.getApplications().filter((app) => app.companyId === company?.id);
    const offers = this.data.getOffers().filter((app) => app.companyId === company?.id);
    this.stats = {
      applicants: applications.length,
      shortlisted: applications.filter((app) => app.status === 'Shortlisted').length,
      offers: offers.length
    };
  }
}
