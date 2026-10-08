import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './company-dashboard.component.html',
  styleUrl: './company-dashboard.component.css'
})
export class CompanyDashboardComponent implements OnInit {
  company: any;
  jobs: any[] = [];
  applicants: any[] = [];
  constructor(private auth: AuthService, public readonly data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.company = this.data.getCompanies().find((c) => c.userId === user?.id);
    this.jobs = this.data.getJobs().filter((j) => j.companyId === this.company?.id);
    this.applicants = this.data.getApplications().filter((a) => a.companyId === this.company?.id);
  }

  get stats() {
    return {
      activeJobs: this.jobs.length,
      totalApplicants: this.applicants.length,
      shortlisted: this.applicants.filter((a) => a.status === 'Shortlisted').length,
      interviews: this.data.getInterviews().filter((i) => i.companyId === this.company?.id).length,
      offers: this.data.getOffers().filter((o) => o.companyId === this.company?.id).length
    };
  }

}
