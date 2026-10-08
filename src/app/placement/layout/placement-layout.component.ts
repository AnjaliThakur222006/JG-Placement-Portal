import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-placement-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './placement-layout.component.html',
  styleUrl: './placement-layout.component.css'
})
export class PlacementLayoutComponent {
  sidebarOpen = false;

  constructor(private auth: AuthService) {}

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }
  logout(): void { void this.auth.logout(); }
}