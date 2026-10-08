import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">System Notifications</h2>
      <div class="list-group">
        <div class="list-group-item border-0 shadow-sm rounded-4 mb-3 p-4"><div class="fw-bold">Portal status update</div><div class="text-secondary">The placement workflow is active and ready for new approvals.</div></div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;}']
})
export class AdminNotificationsComponent {}
