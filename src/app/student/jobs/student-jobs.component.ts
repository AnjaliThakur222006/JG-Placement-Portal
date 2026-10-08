import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { Company, Job, Application } from '../../core/models';

@Component({
  selector: 'app-student-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-jobs.component.html',
  styleUrl: './student-jobs.component.css'
})
export class StudentJobsComponent implements OnInit {
  student: any;
  jobs: Job[] = [];
  companies: Company[] = [];
  search = '';
  selectedType = 'All';
  applications: Application[] = [];

  constructor(private auth: AuthService, private data: DataService, private toast: ToastService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
    this.companies = this.data.getCompanies();
    this.jobs = this.data.getJobs().filter((job) => job.status === 'Approved');
    this.applications = this.data.getApplications().filter((a) => a.studentId === this.student?.id);
  }

  filteredJobs(): Job[] {
    return this.jobs.filter((job) => {
      const company = this.companies.find((c) => c.id === job.companyId)?.name || '';
      const matchesText = !this.search || job.title.toLowerCase().includes(this.search.toLowerCase()) || company.toLowerCase().includes(this.search.toLowerCase()) || job.location.toLowerCase().includes(this.search.toLowerCase());
      const matchesType = this.selectedType === 'All' || job.type === this.selectedType;
      return matchesText && matchesType;
    });
  }

  applyNow(job: Job): void {
    const exists = this.applications.some((application) => application.jobId === job.id);
    if (exists) {
      this.toast.show('You have already applied for this job.', 'warning');
      return;
    }

    const state = this.data.getState();
    const app: Application = {
      id: crypto.randomUUID(),
      studentId: this.student.id,
      jobId: job.id,
      companyId: job.companyId,
      appliedDate: new Date().toISOString(),
      status: 'Applied'
    };
    state.applications.push(app);
    this.data.setState(state);
    this.applications = state.applications.filter((a) => a.studentId === this.student?.id);
    this.toast.show('Application submitted successfully.', 'success');
  }
}
