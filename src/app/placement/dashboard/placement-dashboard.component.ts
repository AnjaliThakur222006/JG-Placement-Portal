import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4">
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <p class="text-muted mb-1">Placement cell</p>
          <h2 class="fw-bold mb-0">Dashboard</h2>
        </div>
        <a routerLink="/placement/reports" class="btn btn-outline-danger">Live reports</a>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Students</div><div class="display-6 fw-bold text-danger">{{ stats.students }}</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Companies</div><div class="display-6 fw-bold text-primary">{{ stats.companies }}</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Jobs</div><div class="display-6 fw-bold text-success">{{ stats.jobs }}</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Offers</div><div class="display-6 fw-bold text-warning">{{ stats.offers }}</div></div></div>
      </div>

      <div class="row g-4">
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Recent applications</h5>
              <a routerLink="/placement/applications" class="text-danger text-decoration-none">View all</a>
            </div>
            <table class="table align-middle mb-0">
              <thead>
                <tr><th>Student</th><th>Company</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let app of recentApplications; trackBy: trackById">
                  <td class="fw-semibold">{{ app.studentName }}</td>
                  <td>{{ app.companyName }}</td>
                  <td><span class="badge rounded-pill text-bg-light text-dark">{{ app.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Live drives</h5>
              <a routerLink="/placement/drives" class="text-danger text-decoration-none">Manage</a>
            </div>
            <div *ngFor="let drive of drives; trackBy: trackById" class="border rounded-3 p-3 mb-2">
              <div class="fw-semibold">{{ drive.name }}</div>
              <small class="text-muted">{{ drive.company }} • {{ drive.date }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementDashboardComponent implements OnInit {
  recentApplications: Array<{ id: string; studentName: string; companyName: string; status: string }> = [];
  drives: Array<{ id: string; name: string; company: string; date: string }> = [];

  constructor(public readonly data: DataService) {}

  ngOnInit(): void {
    const students = this.data.getStudents();
    const companies = this.data.getCompanies();
    const jobs = this.data.getJobs();
    const applications = this.data.getApplications();

    this.recentApplications = applications
      .slice(-4)
      .map((app) => ({
        id: app.id,
        studentName: students.find((student) => student.id === app.studentId)?.fullName ?? 'Student',
        companyName: companies.find((company) => company.id === app.companyId)?.name ?? 'Company',
        status: app.status
      }))
      .reverse();

    this.drives = this.data.getPlacementDrives().slice(0, 3).map((drive) => ({
      id: drive.id,
      name: drive.name,
      company: drive.company,
      date: drive.date
    }));
  }

  get stats() {
    return {
      students: this.data.getStudents().length,
      companies: this.data.getCompanies().length,
      jobs: this.data.getJobs().length,
      offers: this.data.getOffers().length
    };
  }

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
}
