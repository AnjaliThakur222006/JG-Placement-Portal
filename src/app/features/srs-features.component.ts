import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { NotificationItem, User } from '../core/models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-srs-features',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
    
  ],
  templateUrl: './srs-features.component.html',
  styleUrl: './srs-features.component.css'
})
export class SrsFeaturesComponent implements OnInit {

  mode = '';
  title = '';
  loading = false;
  message = '';
  offlineDemoMode = false;

  questions: any[] = [];
  answers: { [key: string]: any } = {};
  result: any = null;
  data: any[] = [];

  selectedJob = '';
  selectedApplication = '';
  selectedAlumni = '';

  portfolio: any = null;
  ranking: any[] = [];
  health: any = null;
  bulkSubject = 'JG Placement Announcement';
  bulkMessage = 'Important placement update from JG Placement Cell.';
  announcementHistory: NotificationItem[] = [];

  otp = '';
  email = '';
  password = '';
  demoOtp = '';

  private readonly api = environment.apiUrl;
  private readonly demoTestAnswers: Record<string, number> = {
    'demo-q1': 1,
    'demo-q2': 2,
    'demo-q3': 0,
    'demo-q4': 1,
    'demo-q5': 1,
    'demo-q6': 0,
    'demo-q7': 1,
    'demo-q8': 0
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly portalData: DataService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] || '';

    const titles: { [key: string]: string } = {
      mockTest: 'Mock Aptitude Test',
      mockInterview: 'Mock Interview',
      portfolio: 'Digital Portfolio',
      alumni: 'Alumni Connect',
      achievements: 'Achievement Wall',
      ranking: 'AI Candidate Ranking',
      verification: 'Verification Center',
      bulk: 'Bulk Notifications',
      health: 'Database Health'
    };

    this.title = titles[this.mode] || 'SRS Feature';

    switch (this.mode) {
      case 'mockTest':
        void this.loadTest();
        break;

      case 'mockInterview':
        void this.loadInterview();
        break;

      case 'portfolio':
        void this.loadPortfolio();
        break;

      case 'alumni':
        void this.loadAlumni();
        break;

      case 'achievements':
        void this.loadAchievements();
        break;

      case 'ranking':
        if (this.portalData.getJobs().length) {
          this.selectedJob = this.portalData.getJobs()[0].id;
          void this.loadRanking();
        }
        break;

      case 'health':
        void this.loadHealth();
        break;

      case 'bulk':
        this.loadAnnouncementHistory();
        break;

      default:
        break;
    }
  }

  loadAnnouncementHistory(): void {
    const uniqueAnnouncements = new Map<string, NotificationItem>();
    for (const notification of this.portalData.getNotifications()) {
      const key = `${notification.title}|${notification.message}`;
      if (!uniqueAnnouncements.has(key)) uniqueAnnouncements.set(key, notification);
    }
    this.announcementHistory = [...uniqueAnnouncements.values()]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 6);
  }

  /**
   * Common API headers.
   * Token is read from localStorage after login.
   */
  headers(): { headers?: HttpHeaders } {
    const token = localStorage.getItem('apiToken');

    if (!token) {
      return {};
    }

    return {
      headers: new HttpHeaders({
        'X-API-Token': token
      })
    };
  }

  private getDemoUser(): User | null {
    const stored = localStorage.getItem('jg_portal_currentUser');
    return stored ? JSON.parse(stored) as User : null;
  }

  private getDemoStudent() {
    const user = this.getDemoUser();
    return this.portalData.getStudents().find((student) => student.userId === user?.id) ?? null;
  }

  private getDemoCollection<T>(key: string, initialValue: T[]): T[] {
    const stored = localStorage.getItem(`jg_portal_${key}`);
    return stored ? JSON.parse(stored) as T[] : initialValue;
  }

  private saveDemoCollection<T>(key: string, records: T[]): void {
    localStorage.setItem(`jg_portal_${key}`, JSON.stringify(records));
  }

  /**
   * Mock Aptitude Test
   */
  async loadTest(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      const response = await firstValueFrom(
        this.http.get<any>(
          `${this.api}/student/mock-test/`,
          this.headers()
        )
      );

      this.questions = Array.isArray(response?.questions)
        ? response.questions
        : [];
      this.offlineDemoMode = false;

    } catch (error: any) {
      this.questions = [
        { id: 'demo-q1', category: 'Quantitative', question: 'A train covers 90 km in 1.5 hours. What is its average speed?', options: ['45 km/h', '60 km/h', '75 km/h', '90 km/h'] },
        { id: 'demo-q2', category: 'Logical', question: 'Find the next number: 3, 6, 12, 24, __.', options: ['30', '36', '48', '54'] },
        { id: 'demo-q3', category: 'Verbal', question: "Choose the closest synonym for 'concise'.", options: ['Brief', 'Unclear', 'Detailed', 'Delayed'] },
        { id: 'demo-q4', category: 'Technical', question: 'Which HTTP status code usually indicates a resource was created?', options: ['200', '201', '301', '404'] },
        { id: 'demo-q5', category: 'Quantitative', question: 'A product costs Rs. 800 and has a 15% discount. What is the sale price?', options: ['Rs. 660', 'Rs. 680', 'Rs. 700', 'Rs. 720'] },
        { id: 'demo-q6', category: 'Logical', question: 'All developers use version control. Mira is a developer. What follows?', options: ['Mira uses version control', 'Mira manages a team', 'All users are developers', 'No conclusion can be drawn'] },
        { id: 'demo-q7', category: 'Technical', question: 'Which data structure follows the FIFO principle?', options: ['Stack', 'Queue', 'Tree', 'Heap'] },
        { id: 'demo-q8', category: 'Technical', question: 'What is the average-case lookup time for a key in a hash table?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'] }
      ];
      this.answers = {};
      this.offlineDemoMode = true;
      this.message = 'Backend is unavailable. A practice test is running in local demo mode.';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  async submitTest(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      this.result = await firstValueFrom(
        this.http.post<any>(
          `${this.api}/student/mock-test/`,
          {
            answers: this.answers
          },
          this.headers()
        )
      );

      this.message = 'Mock test submitted successfully.';
      this.offlineDemoMode = false;

    } catch (error: any) {
      if (this.questions.length && this.questions.every((question) => this.demoTestAnswers[question.id] !== undefined)) {
        const score = this.questions.filter((question) => Number(this.answers[question.id]) === this.demoTestAnswers[question.id]).length;
        this.result = { score, total: this.questions.length, percentage: Math.round(score * 100 / this.questions.length), demo: true };
        const attempts = this.getDemoCollection<Record<string, unknown>>('mock_test_attempts', []);
        attempts.unshift({ ...this.result, completedAt: new Date().toISOString(), userId: this.getDemoUser()?.id });
        this.saveDemoCollection('mock_test_attempts', attempts);
        this.offlineDemoMode = true;
        this.message = 'Mock test result saved in this browser only (demo mode).';
      } else {
        this.result = null;
        this.message = this.getErrorMessage(error, 'Unable to submit mock test.');
      }
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Mock Interview
   */
  async loadInterview(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      const response = await firstValueFrom(
        this.http.get<any>(
          `${this.api}/student/mock-interview/`,
          this.headers()
        )
      );

      this.questions = Array.isArray(response?.questions)
        ? response.questions
        : [];
      this.offlineDemoMode = false;

    } catch (error: any) {
      this.questions = [
        'Tell us about yourself.',
        'Why should we hire you for this role?',
        'Describe a challenging project you completed.',
        'What is your strongest technical skill? Give an example.',
        'Where do you see yourself in five years?'
      ];
      this.answers = {};
      this.offlineDemoMode = true;
      this.message = 'Backend is unavailable. You can practise your interview in local demo mode.';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  async submitInterview(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      this.result = await firstValueFrom(
        this.http.post<any>(
          `${this.api}/student/mock-interview/`,
          {
            questions: this.questions,
            answers: this.answers
          },
          this.headers()
        )
      );

      this.message = 'Mock interview submitted successfully.';
      this.offlineDemoMode = false;

    } catch (error: any) {
      const answered = this.questions.filter((_, index) => String(this.answers[index] ?? '').trim()).length;
      const score = Math.round(answered * 100 / Math.max(this.questions.length, 1));
      const feedback = ['Use concrete examples.', 'Mention measurable outcomes.', 'Keep answers structured and concise.'];
      this.result = { score, feedback, demo: true };
      const attempts = this.getDemoCollection<Record<string, unknown>>('mock_interview_attempts', []);
      attempts.unshift({ ...this.result, completedAt: new Date().toISOString(), userId: this.getDemoUser()?.id });
      this.saveDemoCollection('mock_interview_attempts', attempts);
      this.offlineDemoMode = true;
      this.message = 'Mock interview feedback saved in this browser only (demo mode).';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Portfolio
   */
  async loadPortfolio(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      this.portfolio = await firstValueFrom(
        this.http.get<any>(
          `${this.api}/student/portfolio/`,
          this.headers()
        )
      );
      this.offlineDemoMode = false;

    } catch (error: any) {
      const student = this.getDemoStudent();
      this.portfolio = student ? {
        profile: student,
        academic: { cgpa: student.academic.cgpa, graduationYear: student.academic.graduationYear },
        skills: student.skills.map((skill) => skill.name),
        certificates: student.certificates.map((certificate) => ({ name: certificate.name, issuer: certificate.issuingOrganization, status: certificate.status })),
        resumeScore: student.resume?.score ?? 0,
        shareUrl: `${window.location.origin}/student/portfolio`
      } : null;
      this.offlineDemoMode = true;
      this.message = this.portfolio ? 'Portfolio loaded from local demo data.' : this.getErrorMessage(error, 'Unable to load portfolio.');
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Alumni
   */
  async loadAlumni(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      const response = await firstValueFrom(
        this.http.get<any>(
          `${this.api}/student/alumni/`,
          this.headers()
        )
      );

      this.data = Array.isArray(response?.alumni)
        ? response.alumni
        : [];
      this.offlineDemoMode = false;

    } catch (error: any) {
      this.data = [
        { id: 'demo-alumni-1', name: 'Rohan Shah', graduationYear: 2022, department: 'Computer Science', company: 'TCS', designation: 'Software Engineer', bio: 'Happy to share interview preparation and early-career guidance.', skills: ['Java', 'Spring Boot'], referrals: 2 },
        { id: 'demo-alumni-2', name: 'Priya Patel', graduationYear: 2021, department: 'Information Technology', company: 'Infosys', designation: 'Systems Engineer', bio: 'I can help with resume reviews and placement preparation.', skills: ['Python', 'SQL'], referrals: 1 },
        { id: 'demo-alumni-3', name: 'Kunal Mehta', graduationYear: 2023, department: 'Computer Science', company: 'Tech Mahindra', designation: 'Frontend Developer', bio: 'Reach out for practical advice on frontend interviews.', skills: ['Angular', 'TypeScript'], referrals: 3 }
      ];
      this.offlineDemoMode = true;
      this.message = 'Showing sample alumni profiles in local demo mode.';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  async requestMentorship(): Promise<void> {
    if (!this.selectedAlumni) {
      this.message = 'Please select an alumni first.';
      return;
    }

    try {
      this.loading = true;
      this.message = '';

      await firstValueFrom(
        this.http.post<any>(
          `${this.api}/student/alumni/`,
          {
            alumniId: this.selectedAlumni,
            message:
              'I would like mentorship for placement preparation.'
          },
          this.headers()
        )
      );

      this.message = 'Mentorship request sent successfully.';
      this.offlineDemoMode = false;

    } catch (error: any) {
      const requests = this.getDemoCollection<Record<string, unknown>>('mentorship_requests', []);
      requests.unshift({ id: crypto.randomUUID(), alumniId: this.selectedAlumni, message: 'I would like mentorship for placement preparation.', createdAt: new Date().toISOString(), userId: this.getDemoUser()?.id });
      this.saveDemoCollection('mentorship_requests', requests);
      this.offlineDemoMode = true;
      this.message = 'Mentorship request saved in this browser only (demo mode).';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Achievements
   */
  async loadAchievements(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      const response = await firstValueFrom(
        this.http.get<any>(
          `${this.api}/student/achievements/`,
          this.headers()
        )
      );

      this.data = Array.isArray(response?.achievements)
        ? response.achievements
        : [];
      this.offlineDemoMode = false;

    } catch (error: any) {
      this.data = this.getDemoCollection('demo_achievements', [
        { id: 'demo-achievement-1', student: 'Isha Shah', title: 'Placement Offer Received', description: 'Selected for a graduate role after completing the technical and HR interview rounds.', company: 'JG Technologies', package: '₹4.5 LPA', date: '2026-09-25' },
        { id: 'demo-achievement-2', student: 'Kavya Desai', title: 'Frontend Project Showcase', description: 'Presented an accessible Angular project at the JG University placement showcase.', company: 'JG University', package: '', date: '2026-09-20' }
      ]);
      this.offlineDemoMode = true;
      this.message = 'Showing sample achievements in local demo mode.';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  async addAchievement(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      await firstValueFrom(
        this.http.post<any>(
          `${this.api}/student/achievements/`,
          {
            title: 'Placement Achievement',
            description:
              'Achievement added from the portal.'
          },
          this.headers()
        )
      );

      this.message = 'Achievement added successfully.';

      await this.loadAchievements();

    } catch (error: any) {
      const student = this.getDemoStudent();
      const achievements = this.getDemoCollection<Record<string, unknown>>('demo_achievements', this.data);
      achievements.unshift({ id: crypto.randomUUID(), student: student?.fullName ?? 'Demo Student', title: 'Placement Achievement', description: 'Achievement added from the portal.', company: '', package: '', date: new Date().toISOString() });
      this.saveDemoCollection('demo_achievements', achievements);
      this.data = achievements;
      this.offlineDemoMode = true;
      this.message = 'Achievement saved in this browser only (demo mode).';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * AI Candidate Ranking
   *
   * Explicit response type is used so Angular does not infer
   * HttpSentEvent for response.candidates.
   */
  async loadRanking(): Promise<void> {
    if (!this.selectedJob) {
      this.message = 'Please select a job first.';
      return;
    }

    try {
      this.loading = true;
      this.message = '';

      const response = await firstValueFrom(
        this.http.get<{
          candidates?: any[];
          [key: string]: any;
        }>(
          `${this.api}/company/jobs/${this.selectedJob}/ranking/`,
          this.headers()
        )
      );

      this.ranking = Array.isArray(response?.candidates)
        ? response.candidates
        : [];
      this.offlineDemoMode = false;

    } catch (error: any) {
      const job = this.portalData.getJobs().find((item) => item.id === this.selectedJob);
      this.ranking = this.portalData.getApplications()
        .filter((application) => application.jobId === this.selectedJob)
        .map((application) => {
          const student = this.portalData.getStudents().find((item) => item.id === application.studentId);
          const matchedSkills = job?.requiredSkills.filter((skill) => student?.skills.some((item) => item.name.toLowerCase() === skill.toLowerCase())) ?? [];
          const skillScore = job?.requiredSkills.length ? matchedSkills.length / job.requiredSkills.length * 70 : 0;
          const cgpaScore = Math.min((student?.academic.cgpa ?? 0) / 10, 1) * 30;
          return { studentName: student?.fullName ?? 'Candidate', score: Math.round(skillScore + cgpaScore), matchedSkills };
        })
        .sort((left, right) => right.score - left.score);
      this.offlineDemoMode = true;
      this.message = this.ranking.length ? 'Candidates ranked using local demo data.' : this.getErrorMessage(error, 'No demo applicants are available for this job.');
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Company candidate feedback
   */
  async feedback(): Promise<void> {
    if (!this.selectedApplication) {
      this.message = 'Please select an application first.';
      return;
    }

    try {
      this.loading = true;
      this.message = '';

      await firstValueFrom(
        this.http.post<any>(
          `${this.api}/company/applications/${this.selectedApplication}/feedback/`,
          {
            rating: 5,
            comments: 'Good interview performance.'
          },
          this.headers()
        )
      );

      this.message =
        'Candidate feedback saved successfully.';
      this.offlineDemoMode = false;

    } catch (error: any) {
      const feedback = this.getDemoCollection<Record<string, unknown>>('candidate_feedback', []);
      feedback.unshift({ id: crypto.randomUUID(), applicationId: this.selectedApplication, rating: 5, comments: 'Good interview performance.', createdAt: new Date().toISOString() });
      this.saveDemoCollection('candidate_feedback', feedback);
      this.offlineDemoMode = true;
      this.message = 'Candidate feedback saved in this browser only (demo mode).';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Verification
   */
  async verify(
    type: string,
    id: string,
    action = 'verify'
  ): Promise<void> {
    if (!type || !id) {
      this.message = 'Verification record information is missing.';
      return;
    }

    try {
      this.loading = true;
      this.message = '';

      await firstValueFrom(
        this.http.post<any>(
          `${this.api}/verify/${type}/${id}/`,
          {
            action
          },
          this.headers()
        )
      );

      this.message =
        `${type} ${action}d successfully.`;
      this.offlineDemoMode = false;

    } catch (error: any) {
      const state = this.portalData.getState();
      let updated = false;
      if (type === 'company') {
        const company = state.companies.find((item) => item.id === id);
        if (company) { company.isVerified = action === 'verify'; updated = true; }
      } else if (type === 'job') {
        const job = state.jobs.find((item) => item.id === id);
        if (job) { job.status = action === 'verify' ? 'Approved' : 'Rejected'; updated = true; }
      } else if (type === 'certificate') {
        const certificate = state.certificates.find((item) => item.id === id);
        if (certificate) { certificate.status = action === 'verify' ? 'Verified' : 'Rejected'; updated = true; }
      } else if (type === 'resume') {
        const student = state.students.find((item) => item.id === id);
        if (student?.resume) { student.resume.status = action === 'verify' ? 'Verified' : 'Flagged'; updated = true; }
      }
      if (updated) {
        this.portalData.setState(state);
        this.offlineDemoMode = true;
        this.message = `${type} ${action}d in local demo data.`;
      } else {
        this.message = this.getErrorMessage(error, `Unable to ${action} ${type}. Check the record ID.`);
      }
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Placement bulk notification
   */
  async sendBulk(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      const response = await firstValueFrom(
        this.http.post<any>(
          `${this.api}/placement/bulk-notify/`,
          {
            subject: this.bulkSubject.trim(),
            message: this.bulkMessage.trim(),
            audience: {
              role: 'Student'
            }
          },
          this.headers()
        )
      );

      this.result = response;
      this.message =
        'Bulk notification sent successfully.';
      this.offlineDemoMode = false;
      await this.portalData.initialize();
      this.loadAnnouncementHistory();

    } catch (error: any) {
      const state = this.portalData.getState();
      const recipients = state.users.filter((user) => user.isActive && user.role === 'Student');
      const createdAt = new Date().toISOString();
      const notifications: NotificationItem[] = recipients.map((user) => ({
        id: crypto.randomUUID(),
        userId: user.id,
        title: this.bulkSubject.trim(),
        message: this.bulkMessage.trim(),
        createdAt,
        read: false
      }));
      state.notifications = [...notifications, ...state.notifications];
      this.portalData.setState(state);
      this.result = { recipientCount: recipients.length, inAppSent: recipients.length, emailSentCount: 0, demo: true };
      this.offlineDemoMode = true;
      this.message = `Announcement saved in this browser for ${recipients.length} demo student accounts.`;
      this.loadAnnouncementHistory();
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Database health
   */
  async loadHealth(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      this.health = await firstValueFrom(
        this.http.get<any>(
          `${this.api}/admin/database-health/`,
          this.headers()
        )
      );
      this.offlineDemoMode = false;

    } catch (error: any) {
      const state = this.portalData.getState();
      this.health = { database: 'Local browser storage', storage: 'Demo data available', healthy: true, shared: false, counts: { students: state.students.length, companies: state.companies.length, jobs: state.jobs.length, applications: state.applications.length } };
      this.offlineDemoMode = true;
      this.message = 'Backend database is not connected; showing local demo data status.';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Database backup
   */
  async backup(): Promise<void> {
    try {
      this.loading = true;
      this.message = '';

      this.result = await firstValueFrom(
        this.http.post<any>(
          `${this.api}/admin/database-backup/`,
          {},
          this.headers()
        )
      );

      this.message =
        'Database backup request completed successfully.';
      this.offlineDemoMode = false;

    } catch (error: any) {
      const backup = new Blob([JSON.stringify(this.portalData.getState(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(backup);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jg-placement-demo-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      this.result = { backupCreated: true, file: link.download, storage: 'browser demo data (JSON)' };
      this.offlineDemoMode = true;
      this.message = 'Downloaded a JSON backup of this browser’s demo data (not a MySQL backup).';
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Request OTP
   */
  async requestOtp(): Promise<void> {
    if (!this.email.trim()) {
      this.message = 'Please enter your email.';
      return;
    }

    try {
      this.loading = true;
      this.message = '';

      const response = await firstValueFrom(
        this.http.post<{
          demoOtp?: string;
          detail?: string;
          [key: string]: any;
        }>(
          `${this.api}/auth/request-otp/`,
          {
            email: this.email,
            purpose: 'reset'
          }
        )
      );

      this.demoOtp = response?.demoOtp || '';

      this.message =
        response?.detail ||
        'OTP requested successfully.';

    } catch (error: any) {
      this.demoOtp = '';
      this.message = this.getErrorMessage(
        error,
        'Unable to request OTP.'
      );
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Reset password
   */
  async reset(): Promise<void> {
    if (
      !this.email.trim() ||
      !this.otp.trim() ||
      !this.password.trim()
    ) {
      this.message =
        'Email, OTP and new password are required.';
      return;
    }

    try {
      this.loading = true;
      this.message = '';

      this.result = await firstValueFrom(
        this.http.post<any>(
          `${this.api}/auth/reset-password/`,
          {
            email: this.email,
            otp: this.otp,
            password: this.password
          }
        )
      );

      this.message =
        'Password reset successful.';

    } catch (error: any) {
      this.result = null;
      this.message = this.getErrorMessage(
        error,
        'Unable to reset password.'
      );
    } finally {
      this.loading = false;
      this.changeDetector.markForCheck();
    }
  }

  /**
   * Common error-message helper.
   */
  private getErrorMessage(
    error: any,
    fallback: string
  ): string {
    if (typeof error?.error?.detail === 'string') {
      return error.error.detail;
    }

    if (typeof error?.error?.message === 'string') {
      return error.error.message;
    }

    if (typeof error?.message === 'string') {
      return error.message;
    }

    return fallback;
  }
}