import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Users</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody><tr *ngFor="let user of users"><td>{{ user.name }}</td><td>{{ user.email }}</td><td>{{ user.role }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class AdminUsersComponent {
  users: any[] = [];
  constructor(private data: DataService) { this.users = this.data.getUsers(); }
}
