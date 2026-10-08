import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-jobs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Jobs</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Title</th><th>Company</th><th>Status</th></tr></thead><tbody><tr *ngFor="let job of jobs"><td>{{ job.title }}</td><td>{{ companyLookup[job.companyId]?.name || 'Company' }}</td><td>{{ job.status }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementJobsComponent {
  jobs: any[] = [];
  companyLookup: Record<string, any> = {};
  constructor(private data: DataService) { this.jobs = this.data.getJobs(); this.companyLookup = Object.fromEntries(this.data.getCompanies().map((company) => [company.id, company])); }
}
