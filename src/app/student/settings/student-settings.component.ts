import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-settings.component.html',
  styleUrl: './student-settings.component.css'
})
export class StudentSettingsComponent {
  emailNotifications = true;
  darkMode = false;

  constructor(private auth: AuthService, private toast: ToastService) {}

  save(): void {
    this.toast.show('Settings saved successfully.', 'success');
  }

  logout(): void { this.auth.logout(); }
}
