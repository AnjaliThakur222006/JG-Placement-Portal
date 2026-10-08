import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-student-resume',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-resume.component.html',
  styleUrl: './student-resume.component.css'
})
export class StudentResumeComponent implements OnInit {
  student: any;

  constructor(private auth: AuthService, private data: DataService, private toast: ToastService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
  }

  async uploadResume(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      this.toast.show('Only PDF resumes are accepted.', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.show('Resume must be 5 MB or smaller.', 'warning');
      return;
    }
    try {
      const result = await this.data.uploadResume(file);
      this.student = this.data.getStudents().find((s) => s.userId === this.auth.getCurrentUser()?.id);
      this.toast.show(`Resume uploaded. AI score: ${result.analysis.score}/100`, 'success');
    } catch (error: any) {
      this.toast.show(error?.error?.detail || 'Resume upload failed.', 'warning');
    } finally {
      input.value = '';
    }
  }

  async removeResume(): Promise<void> {
    try {
      await this.data.removeResume();
      this.student = this.data.getStudents().find((s) => s.userId === this.auth.getCurrentUser()?.id);
      this.toast.show('Resume removed.', 'success');
    } catch {
      this.toast.show('Could not remove resume.', 'warning');
    }
  }
}
