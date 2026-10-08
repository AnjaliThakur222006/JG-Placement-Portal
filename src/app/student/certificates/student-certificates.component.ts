import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-certificates.component.html',
  styleUrl: './student-certificates.component.css'
})
export class StudentCertificatesComponent implements OnInit {
  student: any;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private data: DataService, private toast: ToastService, private http: HttpClient) {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      issuingOrganization: ['', Validators.required],
      date: ['', Validators.required],
      credentialId: ['', Validators.required],
      credentialLink: ['']
    });
  }

  private refreshStudent(): void {
    const user = this.auth.getCurrentUser();
    const state = this.data.getState();
    this.student = state.students.find((s) => s.id === this.student?.id) ?? state.students.find((s) => s.userId === user?.id) ?? null;
    if (this.student) {
      this.student.certificates = Array.isArray(this.student.certificates) ? this.student.certificates : [];
    }
  }

  ngOnInit(): void {
    this.refreshStudent();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Please complete all required certificate fields.', 'warning');
      return;
    }

    const state = this.data.getState();
    const user = this.auth.getCurrentUser();
    const studentIndex = state.students.findIndex((s) => s.id === this.student?.id || s.userId === user?.id);

    if (studentIndex < 0) {
      this.toast.show('Student profile was not found. Please refresh and try again.', 'danger');
      return;
    }

    const student = state.students[studentIndex];
    student.certificates = Array.isArray(student.certificates) ? student.certificates : [];

    const record = {
      id: this.form.get('id')?.value || crypto.randomUUID(),
      studentId: student.id,
      name: this.form.get('name')?.value ?? '',
      issuingOrganization: this.form.get('issuingOrganization')?.value ?? '',
      date: this.form.get('date')?.value ?? '',
      credentialId: this.form.get('credentialId')?.value ?? '',
      credentialLink: this.form.get('credentialLink')?.value ?? '',
      status: 'Pending' as const
    };

    const list = [...student.certificates];
    const existingIndex = list.findIndex((item: any) => item.id === record.id);

    if (existingIndex >= 0) list[existingIndex] = record;
    else list.push(record);

    student.certificates = list;
    this.data.setState(state);
    this.student = student;
    this.form.reset();
    this.toast.show('Certificate saved successfully.', 'success');
  }

  async uploadFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    if (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024) { this.toast.show('Certificate must be a PDF up to 5 MB.', 'warning'); return; }
    const token = localStorage.getItem('apiToken'); const form = new FormData(); form.append('file', file); form.append('name', this.form.get('name')?.value || file.name); form.append('issuingOrganization', this.form.get('issuingOrganization')?.value || '');
    try { await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/student/certificate/upload/', form, {headers: token ? {'X-API-Token': token} : {}})); this.toast.show('Certificate uploaded for verification.', 'success'); } catch (e:any) { this.toast.show(e?.error?.detail || 'Certificate upload failed.', 'danger'); }
  }

  edit(record: any): void {
    this.form.patchValue(record);
  }

  delete(record: any): void {
    const state = this.data.getState();
    const idx = state.students.findIndex((s) => s.id === this.student.id);
    state.students[idx].certificates = state.students[idx].certificates.filter((item: any) => item.id !== record.id);
    this.data.setState(state);
    this.student = state.students[idx];
    this.toast.show('Certificate removed.', 'success');
  }
}
