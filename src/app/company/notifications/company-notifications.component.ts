import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="mb-4"><p class="text-muted mb-1">Inbox</p><h2 class="fw-bold mb-0">Notifications</h2></div>
      <div class="list-group">
        <div class="list-group-item border-0 shadow-sm rounded-4 mb-3 p-4" *ngFor="let item of notifications">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="fw-bold mb-1">{{ item.title }}</h6>
              <div class="text-secondary">{{ item.message }}</div>
            </div>
            <span class="badge bg-light text-dark">{{ item.createdAt | date:'shortDate' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;}']
})
export class CompanyNotificationsComponent implements OnInit {
  notifications: any[] = [];
  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.notifications = this.data.getNotifications().filter((item) => item.userId === user?.id);
  }
}
