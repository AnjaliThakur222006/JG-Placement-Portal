import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models';
import { DataService } from './data.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly idleLimit = 30 * 60 * 1000;
  private lastActivity = Date.now();
  private readonly apiUrl = environment.apiUrl;
  private readonly currentUserKey = 'currentUser';

  constructor(
    private storage: StorageService,
    private data: DataService,
    private router: Router,
    private http: HttpClient
  ) {
    const touch = () => this.lastActivity = Date.now();
    ['click','keydown','mousemove','scroll','touchstart'].forEach(event => window.addEventListener(event, touch, { passive: true }));
    window.setInterval(() => {
      if (this.getCurrentUser() && Date.now() - this.lastActivity > this.idleLimit) void this.logout();
    }, 60000);
  }

  getCurrentUser(): User | null {
    const stored = this.storage.getItem<User>(this.currentUserKey);
    if (stored) {
      return stored;
    }

    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '/';
      const match = path.match(/^\/(student|company|placement|admin)(?:\/|$)/);
      if (match) {
        const demoRoleMap: Record<string, Role> = {
          student: 'Student',
          company: 'Company',
          placement: 'Placement',
          admin: 'Admin'
        };
        const demoUser = this.getDemoUserForRole(demoRoleMap[match[1]]);
        if (demoUser) {
          this.setCurrentUser(demoUser);
          return demoUser;
        }
      }
    }

    return null;
  }

  getDemoUserForRole(role: Role): User | null {
    const emailMap: Record<Role, string> = {
      Student: 'student@jg.edu',
      Company: 'company@jg.edu',
      Placement: 'placement@jg.edu',
      Admin: 'admin@jg.edu'
    };

    const email = emailMap[role];
    return email ? this.data.getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase() && user.isActive) ?? null : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) this.storage.setItem(this.currentUserKey, user);
    else this.storage.removeItem(this.currentUserKey);
  }

  async login(email: string, password: string, role: Role): Promise<User | null> {
    try {
      const result = await firstValueFrom(this.http.post<{ user: User; token: string }>(`${this.apiUrl}/auth/login/`, { email, password, role }));
      this.storage.setItem('apiToken', result.token);
      this.setCurrentUser(result.user);
      await this.data.initialize();
      return result.user;
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) return null;
      // Backend unavailable: preserve the original demo fallback so the UI remains usable.
      const match = this.data.getUsers().find((user) =>
        user.email.toLowerCase() === email.toLowerCase() && user.password === password && user.role === role && user.isActive
      );
      if (match) this.setCurrentUser(match);
      return match ?? null;
    }
  }

  async logout(): Promise<void> {
    const token = this.storage.getItem<string>('apiToken');
    if (token) {
      try { await firstValueFrom(this.http.post(`${this.apiUrl}/auth/logout/`, {}, { headers: { 'X-API-Token': token } })); } catch {}
    }
    this.storage.removeItem('apiToken');
    this.setCurrentUser(null);
    await this.router.navigate(['/']);
  }

  async registerStudent(payload: { name: string; email: string; password: string; enrollmentNumber: string; department: string; semester: string; mobile: string; }): Promise<{ user: User; student: any } | null> {
    try {
      const result = await firstValueFrom(this.http.post<{ user: User; student: any }>(`${this.apiUrl}/auth/register/`, payload));
      return result;
    } catch (error: any) {
      if (error?.status === 409 || error?.status === 400) return null;
      // If Django is unavailable, keep the original local fallback.
      const users = this.data.getUsers();
      if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) return null;
      const userId = crypto.randomUUID();
      const user: User = { id: userId, email: payload.email, password: payload.password, role: 'Student', name: payload.name, isActive: true, createdAt: new Date().toISOString() };
      const student = {
        id: crypto.randomUUID(), userId, fullName: payload.name, email: payload.email, enrollmentNumber: payload.enrollmentNumber,
        department: payload.department, semester: payload.semester, mobile: payload.mobile, location: '', about: '', careerObjective: '',
        linkedIn: '', gitHub: '', portfolio: '', profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        academic: { course: 'B.Tech', department: payload.department, semester: payload.semester, cgpa: 0, tenthPercentage: 0, twelfthPercentage: 0, backlogs: 0, graduationYear: 2026 },
        skills: [], certificates: [], createdAt: new Date().toISOString()
      };
      const state = this.data.getState();
      state.users.push(user); state.students.push(student);
      this.data.setState(state);
      this.data.pushAudit('Student registered successfully.', payload.name);
      return { user, student };
    }
  }
}
