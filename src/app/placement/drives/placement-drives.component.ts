import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-drives',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Placement Drives</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Company</th><th>Date</th><th>Status</th></tr></thead><tbody><tr *ngFor="let drive of drives"><td>{{ drive.name }}</td><td>{{ drive.company }}</td><td>{{ drive.date }}</td><td>{{ drive.status }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementDrivesComponent {
  drives: any[] = [];
  constructor(private data: DataService) { this.drives = this.data.getPlacementDrives(); }
}
