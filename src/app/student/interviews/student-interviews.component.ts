import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-student-interviews',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-interviews.component.html',
  styleUrl: './student-interviews.component.css'
})
export class StudentInterviewsComponent implements OnInit {
  student: any;
  interviews: any[] = [];

  constructor(private auth: AuthService, private data: DataService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
    this.interviews = this.data.getInterviews().filter((i) => i.studentId === this.student?.id).map((i) => ({
      ...i,
      company: this.data.getCompanies().find((c) => c.id === i.companyId),
      job: this.data.getJobs().find((j) => j.id === i.jobId)
    }));
  }
}
