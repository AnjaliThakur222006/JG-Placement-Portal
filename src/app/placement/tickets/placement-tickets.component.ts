import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-tickets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Support Tickets</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Raised By</th><th>Subject</th><th>Status</th></tr></thead><tbody><tr *ngFor="let ticket of tickets"><td>{{ ticket.raisedBy }}</td><td>{{ ticket.subject }}</td><td>{{ ticket.status }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementTicketsComponent {
  tickets: any[] = [];
  constructor(private data: DataService) { this.tickets = this.data.getTickets(); }
}
