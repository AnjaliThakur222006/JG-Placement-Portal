import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-company-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div><p class="text-muted mb-1">Company operations</p><h2 class="fw-bold mb-0">Job Listings</h2></div>
        <button class="btn btn-danger" (click)="openNew()">Post New Job</button>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4" *ngIf="editing">
        <h5 class="fw-bold mb-3">{{ editingId ? 'Edit Job' : 'Post New Job' }}</h5>
        <form class="row g-3" (ngSubmit)="save()">
          <div class="col-md-6"><label class="form-label">Job Title</label><input class="form-control" [(ngModel)]="form.title" name="title" required /></div>
          <div class="col-md-6"><label class="form-label">Location</label><input class="form-control" [(ngModel)]="form.location" name="location" /></div>
          <div class="col-md-4"><label class="form-label">Type</label><input class="form-control" [(ngModel)]="form.type" name="type" /></div>
          <div class="col-md-4"><label class="form-label">Salary / CTC</label><input class="form-control" [(ngModel)]="form.salary" name="salary" /></div>
          <div class="col-md-4"><label class="form-label">Vacancies</label><input class="form-control" type="number" [(ngModel)]="form.vacancies" name="vacancies" min="1" /></div>
          <div class="col-12"><label class="form-label">Description</label><textarea class="form-control" rows="3" [(ngModel)]="form.description" name="description"></textarea></div>
          <div class="col-12"><label class="form-label">Required Skills (comma separated)</label><input class="form-control" [(ngModel)]="form.skills" name="skills" /></div>
          <div class="col-12 d-flex gap-2"><button class="btn btn-danger" type="submit">Save Job</button><button class="btn btn-outline-secondary" type="button" (click)="cancel()">Cancel</button></div>
        </form>
      </div>

      <div class="row g-4">
        <div class="col-12" *ngFor="let job of jobs">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div><div class="fw-bold fs-5">{{ job.title }}</div><div class="text-muted">{{ job.location }} • {{ job.type }} • {{ job.vacancies }} vacancies</div></div>
              <span class="badge rounded-pill px-3 py-2" [ngClass]="job.status === 'Approved' ? 'bg-success-subtle text-success' : (job.status === 'Closed' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning')">{{ job.status }}</span>
            </div>
            <p class="text-secondary mt-3 mb-3">{{ job.description }}</p>
            <div class="d-flex flex-wrap gap-2 mb-3"><span class="badge bg-light text-dark" *ngFor="let skill of job.requiredSkills">{{ skill }}</span></div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-semibold text-danger">{{ job.salary }}</span>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm" (click)="edit(job)">Edit</button>
                <button class="btn btn-outline-danger btn-sm" (click)="toggleClose(job)">{{ job.status === 'Closed' ? 'Reopen' : 'Close' }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12" *ngIf="jobs.length === 0"><div class="card border-0 shadow-sm rounded-4 p-4 text-muted">No jobs found. Use “Post New Job” to create one.</div></div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class CompanyJobsComponent implements OnInit {
  jobs: any[] = [];
  company: any;
  editing = false;
  editingId = '';
  form: any = { title: '', location: '', type: 'Full Time', salary: '', vacancies: 1, description: '', skills: '' };

  constructor(private auth: AuthService, private data: DataService, private toast: ToastService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.company = this.data.getCompanies().find((c) => c.userId === user?.id);
    this.refresh();
  }

  refresh(): void {
    this.jobs = this.data.getJobs().filter((job) => job.companyId === this.company?.id);
  }

  openNew(): void {
    this.editing = true; this.editingId = '';
    this.form = { title: '', location: '', type: 'Full Time', salary: '', vacancies: 1, description: '', skills: '' };
  }

  edit(job: any): void {
    this.editing = true; this.editingId = job.id;
    this.form = { title: job.title, location: job.location, type: job.type, salary: job.salary, vacancies: job.vacancies, description: job.description, skills: (job.requiredSkills || []).join(', ') };
  }

  save(): void {
    if (!this.form.title.trim() || !this.company) { this.toast.show('Job title and company are required.', 'warning'); return; }
    const state = this.data.getState();
    const skills = this.form.skills.split(',').map((x: string) => x.trim()).filter(Boolean);
    const record = { id: this.editingId || crypto.randomUUID(), companyId: this.company.id, title: this.form.title.trim(), description: this.form.description || '', location: this.form.location || '', type: this.form.type || 'Full Time', salary: this.form.salary || '', requiredSkills: skills, minimumCGPA: 0, eligibleDepartments: [], deadline: '', vacancies: Number(this.form.vacancies) || 1, status: this.editingId ? (state.jobs.find((j:any) => j.id === this.editingId)?.status || 'Pending') : 'Pending', createdAt: new Date().toISOString() };
    const index = state.jobs.findIndex((j:any) => j.id === record.id);
    if (index >= 0) state.jobs[index] = record; else state.jobs.push(record);
    this.data.setState(state); this.refresh(); this.cancel();
    this.toast.show(this.editingId ? 'Job updated.' : 'Job posted and sent for approval.', 'success');
  }

  toggleClose(job: any): void {
    const state = this.data.getState();
    const item = state.jobs.find((j:any) => j.id === job.id);
    if (item) { item.status = item.status === 'Closed' ? 'Pending' : 'Closed'; this.data.setState(state); this.refresh(); this.toast.show(item.status === 'Closed' ? 'Job closed.' : 'Job reopened for approval.', 'success'); }
  }

  cancel(): void { this.editing = false; this.editingId = ''; }
}
