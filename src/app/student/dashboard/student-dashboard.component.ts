import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { Student, Application, Interview, Job } from '../../core/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  currentUser: any;
  student?: Student;
  sidebarOpen = false;
  applications: Application[] = [];
  interviews: Interview[] = [];
  recommendedJobs: Job[] = [];
  profileCompletion = 0;

  constructor(private auth: AuthService, public readonly data: DataService) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === this.currentUser?.id);
    this.applications = this.data.getApplications().filter((a) => a.studentId === this.student?.id);
    this.interviews = this.data.getInterviews().filter((i) => i.studentId === this.student?.id);
    this.recommendedJobs = this.data.getJobs().filter((job) => job.status === 'Approved').slice(0, 3);
    this.calculateProfileCompletion();
  }

  calculateProfileCompletion(): void {
    const student = this.student;
    if (!student) return;
    const checks = [
      !!student.fullName,
      !!student.mobile,
      !!student.location,
      !!student.careerObjective,
      !!student.linkedIn,
      !!student.gitHub,
      !!student.resume,
      student.skills.length > 0,
      student.certificates.length > 0,
      student.academic.cgpa > 0
    ];
    const completed = checks.filter(Boolean).length;
    this.profileCompletion = Math.round((completed / checks.length) * 100);
  }

  get stats() {
    return {
      totalApplications: this.applications.length,
      shortlisted: this.applications.filter((item) => item.status === 'Shortlisted').length,
      interviews: this.interviews.length,
      offers: this.data.getOffers().filter((offer) => offer.studentId === this.student?.id).length
    };
  }

  logout(): void { this.auth.logout(); }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
