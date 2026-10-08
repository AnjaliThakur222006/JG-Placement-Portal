import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './company-layout.component.html',
  styleUrl: './company-layout.component.css'
})
export class CompanyLayoutComponent {
  sidebarOpen = false;
  company: any;

  constructor(private auth: AuthService, data: DataService) {
    const user = this.auth.getCurrentUser();
    this.company = data.getCompanies().find((item) => item.userId === user?.id);
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }
  logout(): void { void this.auth.logout(); }
}