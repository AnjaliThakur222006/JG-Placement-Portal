import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-placement-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Notifications</h2>
      <div class="list-group">
        <div class="list-group-item border-0 shadow-sm rounded-4 mb-3 p-4"><div class="fw-bold">Review pending</div><div class="text-secondary">Company verification requests and placement updates will appear here.</div></div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;}']
})
export class PlacementNotificationsComponent {}
