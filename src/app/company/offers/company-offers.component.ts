import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-offers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <p class="text-muted mb-1">Offer management</p>
          <h2 class="fw-bold mb-0">Offers</h2>
        </div>
      </div>
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead><tr><th>Student</th><th>Role</th><th>Salary</th><th>Status</th></tr></thead>
            <tbody>
              <tr *ngFor="let offer of offers">
                <td>{{ studentLookup[offer.studentId]?.fullName || 'Candidate' }}</td>
                <td>{{ jobLookup[offer.jobId]?.title || 'Role' }}</td>
                <td>{{ offer.salary }}</td>
                <td><span class="badge bg-success-subtle text-success">{{ offer.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class CompanyOffersComponent implements OnInit {
  offers: any[] = [];
  studentLookup: Record<string, any> = {};
  jobLookup: Record<string, any> = {};
  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    const company = this.data.getCompanies().find((c) => c.userId === user?.id);
    this.offers = this.data.getOffers().filter((item) => item.companyId === company?.id);
    this.studentLookup = Object.fromEntries(this.data.getStudents().map((student) => [student.id, student]));
    this.jobLookup = Object.fromEntries(this.data.getJobs().map((job) => [job.id, job]));
  }
}
