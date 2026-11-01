import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.css'
})
export class CompanyProfileComponent implements OnInit {
  company: any;
  editMode = false;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private data: DataService, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      industry: ['', Validators.required],
      location: ['', Validators.required],
      website: [''],
      description: [''],
      hrName: [''],
      hrEmail: ['', [Validators.required, Validators.email]],
      hrPhone: ['']
    });
  }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.company = this.data.getCompanies().find((c) => c.userId === user?.id);
    this.form.patchValue(this.company);
  }

  openUrl(url: string | null | undefined): string {
    return url && /^https?:\/\//i.test(url) ? url : `https://${url ?? ''}`;
  }

  save(): void {
    const state = this.data.getState();
    const idx = state.companies.findIndex((c) => c.id === this.company.id);
    const payload = {
      name: this.form.get('name')?.value ?? '',
      industry: this.form.get('industry')?.value ?? '',
      location: this.form.get('location')?.value ?? '',
      website: this.form.get('website')?.value ?? '',
      description: this.form.get('description')?.value ?? '',
      hrName: this.form.get('hrName')?.value ?? '',
      hrEmail: this.form.get('hrEmail')?.value ?? '',
      hrPhone: this.form.get('hrPhone')?.value ?? ''
    };
    state.companies[idx] = { ...state.companies[idx], ...payload };
    this.data.setState(state);
    this.company = state.companies[idx];
    this.editMode = false;
    this.toast.show('Company profile updated successfully.', 'success');
  }
}
