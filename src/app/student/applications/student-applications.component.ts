import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-student-applications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-applications.component.html',
  styleUrl: './student-applications.component.css'
})
export class StudentApplicationsComponent implements OnInit {
  student: any;
  applications: any[] = [];

  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
    this.applications = this.data.getApplications().filter((app) => app.studentId === this.student?.id).map((app) => ({
      ...app,
      job: this.data.getJobs().find((job) => job.id === app.jobId),
      company: this.data.getCompanies().find((company) => company.id === app.companyId)
    }));
  }
}
