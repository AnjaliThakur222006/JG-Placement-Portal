import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-student-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-notifications.component.html',
  styleUrl: './student-notifications.component.css'
})
export class StudentNotificationsComponent implements OnInit {
  notifications: any[] = [];

  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    const student = this.data.getStudents().find((s) => s.userId === user?.id);
    this.notifications = this.data.getNotifications().filter((note) => note.userId === user?.id || note.userId === student?.id);
  }
}
