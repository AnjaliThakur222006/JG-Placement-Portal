import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Companies</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Industry</th><th>Location</th></tr></thead><tbody><tr *ngFor="let company of companies"><td>{{ company.name }}</td><td>{{ company.industry }}</td><td>{{ company.location }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class AdminCompaniesComponent {
  companies: any[] = [];
  constructor(private data: DataService) { this.companies = this.data.getCompanies(); }
}
