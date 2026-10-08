import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Roles</h2>
      <div class="row g-4">
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="fw-bold mb-2">Student</div><div class="text-muted">Applications, interviews and profile access</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="fw-bold mb-2">Company</div><div class="text-muted">Student management and hiring</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="fw-bold mb-2">Placement</div><div class="text-muted">Drives, reports and coordination</div></div></div>
        <div class="col-md-3"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="fw-bold mb-2">Admin</div><div class="text-muted">System oversight and control</div></div></div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class AdminRolesComponent {}
