import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-student-academic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-academic.component.html',
  styleUrl: './student-academic.component.css'
})
export class StudentAcademicComponent implements OnInit {
  student: any;
  editMode = false;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private data: DataService, private toast: ToastService) {
    this.form = this.fb.group({
      course: ['B.Tech', Validators.required],
      department: ['', Validators.required],
      semester: ['', Validators.required],
      cgpa: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      tenthPercentage: [0, Validators.required],
      twelfthPercentage: [0, Validators.required],
      backlogs: [0, Validators.required],
      graduationYear: [2026, Validators.required]
    });
  }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
    this.form.patchValue(this.student?.academic || {});
  }

  save(): void {
    const state = this.data.getState();
    const idx = state.students.findIndex((s) => s.id === this.student.id);
    const academic = {
      course: this.form.get('course')?.value ?? 'B.Tech',
      department: this.form.get('department')?.value ?? '',
      semester: this.form.get('semester')?.value ?? '',
      cgpa: Number(this.form.get('cgpa')?.value ?? 0),
      tenthPercentage: Number(this.form.get('tenthPercentage')?.value ?? 0),
      twelfthPercentage: Number(this.form.get('twelfthPercentage')?.value ?? 0),
      backlogs: Number(this.form.get('backlogs')?.value ?? 0),
      graduationYear: Number(this.form.get('graduationYear')?.value ?? 2026)
    };
    state.students[idx].academic = academic;
    this.data.setState(state);
    this.student = state.students[idx];
    this.editMode = false;
    this.toast.show('Academic details updated successfully.', 'success');
  }
}
