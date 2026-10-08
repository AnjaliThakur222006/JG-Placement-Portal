import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-z][A-Za-z .'-]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      enrollmentNumber: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[A-Za-z0-9-]+$/)]],
      department: ['', [Validators.required, Validators.minLength(2)]],
      semester: ['', [Validators.required, Validators.pattern(/^(1|2|3|4|5|6|7|8)(st|nd|rd|th)?$/i)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  errorMessage(controlName: string): string {
    const errors = this.form.get(controlName)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required.';
    if (errors['email']) return 'Enter a valid email address.';
    if (errors['minlength']) return `Enter at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['pattern'] && controlName === 'mobile') return 'Use a valid 10-digit Indian mobile number.';
    if (errors['pattern'] && controlName === 'password') return 'Use 8+ characters with uppercase, lowercase, number and symbol.';
    if (errors['pattern'] && controlName === 'semester') return 'Use a semester from 1st to 8th.';
    if (errors['pattern']) return 'Use only valid letters, numbers and hyphens.';
    return 'Enter a valid value.';
  }

  passwordMatchValidator(group: any) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Please complete all required fields correctly.', 'warning');
      return;
    }

    const result = await this.auth.registerStudent({
      name: this.form.value.fullName || '',
      email: this.form.value.email || '',
      password: this.form.value.password || '',
      enrollmentNumber: this.form.value.enrollmentNumber || '',
      department: this.form.value.department || '',
      semester: this.form.value.semester || '',
      mobile: this.form.value.mobile || ''
    });

    if (!result) {
      this.toast.show('A user with this email already exists.', 'danger');
      return;
    }

    localStorage.setItem('pendingVerifyEmail', this.form.value.email || '');
    const demoOtp = (result as any)?.demoOtp || '';
    if (demoOtp) {
      localStorage.setItem('pendingDemoOtp', demoOtp);
    } else {
      localStorage.removeItem('pendingDemoOtp');
    }
    this.toast.show('Registration successful. Verify your email with the OTP.', 'success');
    this.router.navigate(['/verify-email']);
  }
}
