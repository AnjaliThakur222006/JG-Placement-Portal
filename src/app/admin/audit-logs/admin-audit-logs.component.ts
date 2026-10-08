import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Audit Logs</h2>
      <div class="list-group">
        <div class="list-group-item border-0 shadow-sm rounded-4 mb-3 p-4" *ngFor="let item of logs">
          <div class="d-flex justify-content-between">
            <div><div class="fw-bold">{{ item.user }}</div><div class="text-secondary">{{ item.action }}</div></div>
            <span class="text-muted small">{{ item.createdAt | date:'short' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;}']
})
export class AdminAuditLogsComponent {
  logs: any[] = [];
  constructor(private data: DataService) { this.logs = this.data.getAuditLogs(); }
}
