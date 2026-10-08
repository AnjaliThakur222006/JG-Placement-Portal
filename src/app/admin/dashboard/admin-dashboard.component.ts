import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="mb-4"><p class="text-muted mb-1">Administration</p><h2 class="fw-bold mb-0">Admin Dashboard</h2></div>
      <div class="row g-4">
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Users</div><div class="display-6 fw-bold text-danger">24</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Students</div><div class="display-6 fw-bold text-primary">120</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Companies</div><div class="display-6 fw-bold text-success">18</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Pending</div><div class="display-6 fw-bold text-warning">7</div></div></div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class AdminDashboardComponent {}
