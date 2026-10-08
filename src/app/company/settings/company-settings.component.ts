import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="mb-4"><p class="text-muted mb-1">Preferences</p><h2 class="fw-bold mb-0">Company Settings</h2></div>
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <form [formGroup]="form" class="row g-3" (ngSubmit)="save()">
          <div class="col-md-6"><label class="form-label">Notification Email</label><input class="form-control" formControlName="email" /></div>
          <div class="col-md-6"><label class="form-label">Default Interview Mode</label><input class="form-control" formControlName="mode" /></div>
          <div class="col-12"><button class="btn btn-danger" type="submit">Save Preferences</button></div>
        </form>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class CompanySettingsComponent {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mode: ['Online', Validators.required]
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    localStorage.setItem('companySettings', JSON.stringify(this.form.getRawValue()));
    this.toast.show('Company preferences saved.', 'success');
  }
}
