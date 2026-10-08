import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Applications</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Student</th><th>Job</th><th>Status</th></tr></thead><tbody><tr *ngFor="let app of apps"><td>{{ studentLookup[app.studentId]?.fullName || 'Student' }}</td><td>{{ jobLookup[app.jobId]?.title || 'Role' }}</td><td>{{ app.status }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementApplicationsComponent {
  apps: any[] = [];
  studentLookup: Record<string, any> = {};
  jobLookup: Record<string, any> = {};
  constructor(private data: DataService) {
    this.apps = this.data.getApplications();
    this.studentLookup = Object.fromEntries(this.data.getStudents().map((student) => [student.id, student]));
    this.jobLookup = Object.fromEntries(this.data.getJobs().map((job) => [job.id, job]));
  }
}
