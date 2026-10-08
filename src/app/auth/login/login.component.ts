import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showPassword = false;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Student', Validators.required],
      rememberMe: [false]
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  errorMessage(controlName: string): string {
    const errors = this.loginForm.get(controlName)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required.';
    if (errors['email']) return 'Enter a valid email address.';
    if (errors['minlength']) return 'Password must be at least 6 characters.';
    return 'Enter a valid value.';
  }

  async submit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toast.show('Please enter valid credentials.', 'warning');
      return;
    }

    const { email, password, role } = this.loginForm.value;
    const user = await this.auth.login(email || '', password || '', (role as any) || 'Student');
    if (!user) {
      this.toast.show('Invalid credentials. Please try again.', 'danger');
      return;
    }

    this.toast.show('Login successful.', 'success');
    const map: Record<string, string> = {
      Student: '/student/dashboard',
      Company: '/company/dashboard',
      Placement: '/placement/dashboard',
      Admin: '/admin/dashboard'
    };
    this.router.navigateByUrl(map[user.role]);
  }
}
