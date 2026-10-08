import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.css'
})
export class StudentProfileComponent implements OnInit {
  student: any;
  editMode = false;
  form!: FormGroup;
  photoOptions = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  ];

  constructor(private fb: FormBuilder, private auth: AuthService, private data: DataService, private toast: ToastService) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      enrollmentNumber: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[A-Za-z0-9-]+$/)]],
      department: ['', [Validators.required, Validators.minLength(2)]],
      semester: ['', [Validators.required, Validators.pattern(/^(1|2|3|4|5|6|7|8)(st|nd|rd|th)?$/i)]],
      location: [''],
      about: [''],
      careerObjective: [''],
      linkedIn: [''],
      gitHub: [''],
      portfolio: [''],
      profileImage: ['']
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
    this.applyForm();
  }

  applyForm(): void {
    this.form.patchValue({
      fullName: this.student?.fullName || '',
      email: this.student?.email || '',
      mobile: this.student?.mobile || '',
      enrollmentNumber: this.student?.enrollmentNumber || '',
      department: this.student?.department || '',
      semester: this.student?.semester || '',
      location: this.student?.location || '',
      about: this.student?.about || '',
      careerObjective: this.student?.careerObjective || '',
      linkedIn: this.student?.linkedIn || '',
      gitHub: this.student?.gitHub || '',
      portfolio: this.student?.portfolio || '',
      profileImage: this.student?.profileImage || this.photoOptions[0]
    });
  }

  choosePhoto(url: string): void {
    this.form.patchValue({ profileImage: url });
    if (this.student) this.student.profileImage = url;
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.show('Please upload a valid image file.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        this.form.patchValue({ profileImage: result });
        if (this.student) this.student.profileImage = result;
      }
    };
    reader.readAsDataURL(file);
  }

  openUrl(url: string | null | undefined): string {
    return url && /^https?:\/\//i.test(url) ? url : `https://${url ?? ''}`;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Please correct the highlighted profile fields.', 'warning');
      return;
    }
    const state = this.data.getState();
    const idx = state.students.findIndex((s) => s.id === this.student.id);
    if (idx >= 0) {
      const payload = {
        fullName: this.form.get('fullName')?.value ?? '',
        email: this.form.get('email')?.value ?? '',
        mobile: this.form.get('mobile')?.value ?? '',
        enrollmentNumber: this.form.get('enrollmentNumber')?.value ?? '',
        department: this.form.get('department')?.value ?? '',
        semester: this.form.get('semester')?.value ?? '',
        location: this.form.get('location')?.value ?? '',
        about: this.form.get('about')?.value ?? '',
        careerObjective: this.form.get('careerObjective')?.value ?? '',
        linkedIn: this.form.get('linkedIn')?.value ?? '',
        gitHub: this.form.get('gitHub')?.value ?? '',
        portfolio: this.form.get('portfolio')?.value ?? ''
      };
      const profileImage = this.form.get('profileImage')?.value || state.students[idx].profileImage || this.photoOptions[0];
      state.students[idx] = { ...state.students[idx], ...payload, profileImage };
      this.data.setState(state);
      this.student = state.students[idx];
      this.editMode = false;
      this.toast.show('Profile updated successfully.', 'success');
    }
  }
}
