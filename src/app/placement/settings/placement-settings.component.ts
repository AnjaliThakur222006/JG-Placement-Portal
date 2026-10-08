import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-placement-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Placement Settings</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <form [formGroup]="form" class="row g-3" (ngSubmit)="save()">
          <div class="col-md-6"><label class="form-label">Drive Email</label><input class="form-control" formControlName="email" /></div>
          <div class="col-md-6"><label class="form-label">Default Venue</label><input class="form-control" formControlName="venue" /></div>
          <div class="col-12"><button class="btn btn-danger" type="submit">Save Settings</button></div>
        </form>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementSettingsComponent {
  form!: FormGroup;

  constructor(private fb: FormBuilder, private toast: ToastService) {
    this.form = this.fb.group({
      email: ['placement@jg.edu', [Validators.required, Validators.email]],
      venue: ['Main Auditorium', Validators.required]
    });
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    localStorage.setItem('placementSettings', JSON.stringify(this.form.getRawValue()));
    this.toast.show('Placement settings saved.', 'success');
  }
}
