import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Reports</h2>
      <div class="row g-4">
        <div class="col-md-4"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Offer Rate</div><div class="display-6 fw-bold text-danger">{{ offerRate }}%</div></div></div>
        <div class="col-md-4"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Drive Count</div><div class="display-6 fw-bold text-primary">{{ driveCount }}</div></div></div>
        <div class="col-md-4"><div class="card border-0 shadow-sm rounded-4 p-4 bg-white"><div class="text-muted">Selected / Offered</div><div class="display-6 fw-bold text-success">{{ selectedCount }}</div></div></div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementReportsComponent implements OnInit {
  offerRate = 0; driveCount = 0; selectedCount = 0;
  constructor(private data: DataService) {}
  ngOnInit(): void {
    const apps = this.data.getApplications(); const offers = this.data.getOffers();
    this.driveCount = this.data.getPlacementDrives().length;
    this.selectedCount = apps.filter((a:any) => a.status === 'Selected').length + offers.length;
    this.offerRate = apps.length ? Math.round((this.selectedCount / apps.length) * 100) : 0;
  }
}
