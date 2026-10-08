import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-student-skills',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-skills.component.html',
  styleUrl: './student-skills.component.css'
})
export class StudentSkillsComponent implements OnInit {
  student: any;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private data: DataService, private toast: ToastService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      proficiency: ['Beginner', Validators.required]
    });
  }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
  }

  addSkill(): void {
    if (this.form.invalid) return;
    const state = this.data.getState();
    const idx = state.students.findIndex((s) => s.id === this.student.id);
    const name = this.form.get('name')?.value ?? '';
    const proficiency = this.form.get('proficiency')?.value ?? 'Beginner';
    state.students[idx].skills.push({
      name,
      proficiency: proficiency as 'Beginner' | 'Intermediate' | 'Advanced'
    });
    this.data.setState(state);
    this.student = state.students[idx];
    this.form.reset({ proficiency: 'Beginner' });
    this.toast.show('Skill added successfully.', 'success');
  }

  deleteSkill(index: number): void {
    const state = this.data.getState();
    const idx = state.students.findIndex((s) => s.id === this.student.id);
    state.students[idx].skills.splice(index, 1);
    this.data.setState(state);
    this.student = state.students[idx];
    this.toast.show('Skill removed.', 'success');
  }
}
