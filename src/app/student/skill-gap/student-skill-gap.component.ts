import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-student-skill-gap',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-skill-gap.component.html',
  styleUrl: './student-skill-gap.component.css'
})
export class StudentSkillGapComponent implements OnInit {
  student: any;
  recommended: any[] = [];

  constructor(private auth: AuthService, private data: DataService) {}

  async ngOnInit(): Promise<void> {
    const user = this.auth.getCurrentUser();
    this.student = this.data.getStudents().find((s) => s.userId === user?.id);
    try {
      const results = await this.data.getSkillGap();
      this.recommended = results.map((entry: any) => ({
        job: entry.job,
        match: entry.score,
        matched: entry.matchedSkills,
        missing: entry.missingSkills
      }));
    } catch {
      // Backend is expected to be running; retain a local calculation for graceful UI fallback.
      const jobs = this.data.getJobs().filter((job) => job.status === 'Approved');
      const studentSkills = this.student?.skills.map((s: any) => s.name.toLowerCase()) || [];
      this.recommended = jobs.map((job) => {
        const requiredSkills = job.requiredSkills.map((skill: string) => skill.toLowerCase());
        const matched = requiredSkills.filter((skill: string) => studentSkills.includes(skill));
        const missing = requiredSkills.filter((skill: string) => !studentSkills.includes(skill));
        const match = requiredSkills.length ? Math.round((matched.length / requiredSkills.length) * 100) : 100;
        return { job, match, matched, missing };
      }).sort((a, b) => b.match - a.match).slice(0, 3);
    }
  }
}
