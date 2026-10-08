import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-interviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Interviews</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Candidate</th><th>Company</th><th>Date</th></tr></thead><tbody><tr *ngFor="let interview of interviews"><td>{{ studentLookup[interview.studentId]?.fullName || 'Candidate' }}</td><td>{{ companyLookup[interview.companyId]?.name || 'Company' }}</td><td>{{ interview.date }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementInterviewsComponent {
  interviews: any[] = [];
  studentLookup: Record<string, any> = {};
  companyLookup: Record<string, any> = {};
  constructor(private data: DataService) {
    this.interviews = this.data.getInterviews();
    this.studentLookup = Object.fromEntries(this.data.getStudents().map((student) => [student.id, student]));
    this.companyLookup = Object.fromEntries(this.data.getCompanies().map((company) => [company.id, company]));
  }
}
