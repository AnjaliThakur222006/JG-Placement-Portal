import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-backup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Backup & Recovery</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <button class="btn btn-danger mb-3" (click)="createBackup()" [disabled]="isCreating">
          {{ isCreating ? 'Creating database backup...' : 'Create MySQL Backup' }}
        </button>
        <div *ngIf="statusMessage" class="alert alert-success mb-0">{{ statusMessage }}</div>
        <div *ngIf="errorMessage" class="alert alert-danger mb-0">{{ errorMessage }}</div>
        <div *ngIf="lastBackup" class="text-secondary mt-3">Last successful backup: {{ lastBackup }}</div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class AdminBackupComponent {
  lastBackup = localStorage.getItem('lastBackup') || '';
  isCreating = false;
  statusMessage = '';
  errorMessage = '';

  constructor(private data: DataService) {}

  async createBackup(): Promise<void> {
    this.isCreating = true;
    this.statusMessage = '';
    this.errorMessage = '';
    try {
      const backup = await this.data.createDatabaseBackup();
      this.lastBackup = new Date().toLocaleString();
      localStorage.setItem('lastBackup', this.lastBackup);
      this.statusMessage = `Backup ${backup.file} created on the server (${backup.size.toLocaleString()} bytes).`;
    } catch (error: any) {
      this.errorMessage = error?.error?.detail || error?.message || 'The database backup could not be created.';
    } finally {
      this.isCreating = false;
    }
  }
}
