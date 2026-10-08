import { CommonModule } from '@angular/common'; import { Component } from '@angular/core'; import { FormsModule } from '@angular/forms'; import { Router, RouterLink } from '@angular/router'; import { HttpClient } from '@angular/common/http'; import { firstValueFrom } from 'rxjs';
@Component({selector:'app-verify-email',standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./verify-email.component.html',styleUrl:'./verify-email.component.css'})
export class VerifyEmailComponent {
  email = localStorage.getItem('pendingVerifyEmail') || '';
  otp = '';
  demoOtp = localStorage.getItem('pendingDemoOtp') || '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {
    if (this.email && !this.demoOtp) this.loadDemoOtp();
  }

  async loadDemoOtp() {
    if (!this.email) return;
    try {
      const r: any = await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/auth/request-otp/', { email: this.email, purpose: 'verify' }));
      this.demoOtp = r?.demoOtp || '';
      if (this.demoOtp) localStorage.setItem('pendingDemoOtp', this.demoOtp);
      this.message = r?.detail || 'OTP generated.';
    } catch (e: any) {
      this.message = e?.error?.detail || 'Could not generate OTP.';
    }
  }

  async verify(){try{await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/auth/verify-otp/',{email:this.email,otp:this.otp,purpose:'verify'}));localStorage.removeItem('pendingVerifyEmail');localStorage.removeItem('pendingDemoOtp');this.message='Email verified. You can now login.';setTimeout(()=>this.router.navigate(['/login']),600);}catch(e:any){this.message=e?.error?.detail||'Invalid OTP.';}} async resend(){const r:any=await firstValueFrom(this.http.post('http://127.0.0.1:8000/api/auth/request-otp/',{email:this.email,purpose:'verify'}));this.demoOtp=r.demoOtp||'';if(this.demoOtp)localStorage.setItem('pendingDemoOtp',this.demoOtp);this.message=r.detail;}}
