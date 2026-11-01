import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DataService } from '../core/services/data.service';
import { NotificationItem } from '../core/models';
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly portalData: DataService
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

    } catch (error: any) {
      this.questions = [];
      this.message = this.getErrorMessage(
        error,
        'Unable to load mock test.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.result = null;
      this.message = this.getErrorMessage(
        error,
        'Unable to submit mock test.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.questions = [];
      this.message = this.getErrorMessage(
        error,
        'Unable to load mock interview.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.result = null;
      this.message = this.getErrorMessage(
        error,
        'Unable to submit mock interview.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.portfolio = null;
      this.message = this.getErrorMessage(
        error,
        'Unable to load portfolio.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.data = [];
      this.message = this.getErrorMessage(
        error,
        'Unable to load alumni.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.message = this.getErrorMessage(
        error,
        'Unable to send mentorship request.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.data = [];
      this.message = this.getErrorMessage(
        error,
        'Unable to load achievements.'
      );
    } finally {
      this.loading = false;
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
      this.message = this.getErrorMessage(
        error,
        'Unable to add achievement.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.ranking = [];
      this.message = this.getErrorMessage(
        error,
        'Unable to load candidate ranking.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.message = this.getErrorMessage(
        error,
        'Unable to save candidate feedback.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.message = this.getErrorMessage(
        error,
        `Unable to ${action} ${type}.`
      );
    } finally {
      this.loading = false;
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
      await this.portalData.initialize();
      this.loadAnnouncementHistory();

    } catch (error: any) {
      this.result = null;
      this.message = this.getErrorMessage(
        error,
        'Unable to send bulk notification.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.health = null;
      this.message = this.getErrorMessage(
        error,
        'Unable to load database health.'
      );
    } finally {
      this.loading = false;
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

    } catch (error: any) {
      this.result = null;
      this.message = this.getErrorMessage(
        error,
        'Unable to create database backup.'
      );
    } finally {
      this.loading = false;
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