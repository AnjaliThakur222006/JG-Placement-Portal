import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, AuditLog, CertificateItem, Company, Department, Interview, Job, NotificationItem, Offer, PlacementDrive, Student, Ticket, User, PortalState } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private storage: StorageService, private http: HttpClient) {
    this.seedBaseAccounts();
  }

  async uploadResume(file: File): Promise<any> {
    const token = this.storage.getItem<string>('apiToken');
    const form = new FormData();
    form.append('file', file);
    const result = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/student/resume/upload/`, form, {
      headers: token ? { 'X-API-Token': token } : {}
    }));
    await this.initialize();
    return result;
  }

  async removeResume(): Promise<void> {
    const token = this.storage.getItem<string>('apiToken');
    await firstValueFrom(this.http.delete(`${this.apiUrl}/student/resume/`, {
      headers: token ? { 'X-API-Token': token } : {}
    }));
    await this.initialize();
  }

  async getSkillGap(): Promise<any[]> {
    const token = this.storage.getItem<string>('apiToken');
    const result = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/ai/skill-gap/`, {
      headers: token ? { 'X-API-Token': token } : {}
    }));
    return result.results || [];
  }

  async getReadiness(): Promise<any> {
    const token = this.storage.getItem<string>('apiToken');
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/ai/readiness/`, {
      headers: token ? { 'X-API-Token': token } : {}
    }));
  }

  async createDatabaseBackup(): Promise<{ backupCreated: boolean; file: string; size: number }> {
    const token = this.storage.getItem<string>('apiToken');
    if (!token) throw new Error('Sign in as an administrator to create a database backup.');
    return firstValueFrom(this.http.post<{ backupCreated: boolean; file: string; size: number }>(
      `${this.apiUrl}/admin/database-backup/`,
      {},
      { headers: { 'X-API-Token': token } }
    ));
  }

  private readonly stateKey = 'state';

  /** Load the UI state from Django before Angular routes/components start. */
  async initialize(): Promise<void> {
    try {
      const state = await firstValueFrom(this.http.get<PortalState>(`${this.apiUrl}/state/`));
      this.storage.setItem(this.stateKey, state);
    } catch {
      // Local state remains as a safe fallback when Django is not running yet.
    }
  }

  private defaultState(): PortalState {
    const now = new Date().toISOString();
    const users: User[] = [
      { id: 'u1', email: 'student@jg.edu', password: 'student123', role: 'Student', name: 'Student User', isActive: true, createdAt: now },
      { id: 'u2', email: 'company@jg.edu', password: 'company123', role: 'Company', name: 'Company User', isActive: true, createdAt: now },
      { id: 'u3', email: 'placement@jg.edu', password: 'placement123', role: 'Placement', name: 'Placement Cell', isActive: true, createdAt: now },
      { id: 'u4', email: 'admin@jg.edu', password: 'admin123', role: 'Admin', name: 'Admin User', isActive: true, createdAt: now },
      { id: 'u5', email: 'aditi@jg.edu', password: 'student123', role: 'Student', name: 'Aditi Sharma', isActive: true, createdAt: now },
      { id: 'u6', email: 'hr@cloudworks.example', password: 'company123', role: 'Company', name: 'CloudWorks HR', isActive: true, createdAt: now },
      { id: 'u7', email: 'dev@jg.edu', password: 'student123', role: 'Student', name: 'Dev Patel', isActive: true, createdAt: now },
      { id: 'u8', email: 'isha@jg.edu', password: 'student123', role: 'Student', name: 'Isha Shah', isActive: true, createdAt: now },
      { id: 'u9', email: 'neel@jg.edu', password: 'student123', role: 'Student', name: 'Neel Mehta', isActive: true, createdAt: now },
      { id: 'u10', email: 'kavya@jg.edu', password: 'student123', role: 'Student', name: 'Kavya Desai', isActive: true, createdAt: now },
    ];

    const students: Student[] = [
      {
        id: 's1', userId: 'u1', fullName: 'Student User', email: 'student@jg.edu', enrollmentNumber: 'JG2026IT001',
        department: 'Information Technology', semester: '6', mobile: '9999999999', location: 'Ahmedabad',
        about: 'Final-year IT student focused on full-stack development and placement readiness.',
        careerObjective: 'To work as a software developer building scalable products for real-world business problems.',
        linkedIn: 'https://www.linkedin.com/in/student-user/', gitHub: 'https://github.com/student-user', portfolio: 'https://student-user.dev',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        academic: {
          course: 'B.Tech', department: 'Information Technology', semester: '6', cgpa: 8.4, tenthPercentage: 87,
          twelfthPercentage: 82, backlogs: 0, graduationYear: 2026
        },
        skills: [
          { name: 'Python', proficiency: 'Advanced' },
          { name: 'Django', proficiency: 'Advanced' },
          { name: 'SQL', proficiency: 'Advanced' },
          { name: 'Angular', proficiency: 'Intermediate' }
        ],
        resume: {
          fileName: 'Student_User_Resume.pdf', uploadedAt: now, status: 'Verified', score: 86,
          suggestions: ['Keep improving project depth and internship exposure.']
        },
        certificates: [{
          id: 'c1', studentId: 's1', name: 'AWS Cloud Practitioner', issuingOrganization: 'Amazon Web Services',
          date: '2025-03-12', credentialId: 'AWS-CP-2025-01', credentialLink: 'https://aws.amazon.com/certification/',
          status: 'Verified'
        }],
        createdAt: now
      },
      {
        id: 's2', userId: 'u5', fullName: 'Aditi Sharma', email: 'aditi@jg.edu', enrollmentNumber: 'JG2026CS014',
        department: 'Computer Science', semester: '7', mobile: '9876543210', location: 'Vadodara',
        about: 'Curious about data analytics and product engineering with strong communication skills.',
        careerObjective: 'To join a product-focused company that values problem solving, creativity and learning.',
        linkedIn: 'https://www.linkedin.com/in/aditi-sharma/', gitHub: 'https://github.com/aditi-sharma', portfolio: 'https://aditisharma.dev',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        academic: {
          course: 'B.Tech', department: 'Computer Science', semester: '7', cgpa: 8.1, tenthPercentage: 84,
          twelfthPercentage: 80, backlogs: 1, graduationYear: 2027
        },
        skills: [
          { name: 'Java', proficiency: 'Advanced' },
          { name: 'Spring Boot', proficiency: 'Intermediate' },
          { name: 'SQL', proficiency: 'Advanced' },
          { name: 'Problem Solving', proficiency: 'Advanced' }
        ],
        certificates: [{
          id: 'c2', studentId: 's2', name: 'Oracle SQL Associate', issuingOrganization: 'Oracle',
          date: '2024-11-02', credentialId: 'ORA-SQL-891', credentialLink: 'https://education.oracle.com/',
          status: 'Pending'
        }],
        createdAt: now
      },
      ...[
        { id: 's3', userId: 'u7', fullName: 'Dev Patel', email: 'dev@jg.edu', enrollmentNumber: 'JG2026IT022', department: 'Information Technology', semester: '7', cgpa: 7.9, skills: ['Python', 'Django', 'JavaScript'] },
        { id: 's4', userId: 'u8', fullName: 'Isha Shah', email: 'isha@jg.edu', enrollmentNumber: 'JG2026CS031', department: 'Computer Science', semester: '6', cgpa: 8.7, skills: ['Java', 'SQL', 'Power BI'] },
        { id: 's5', userId: 'u9', fullName: 'Neel Mehta', email: 'neel@jg.edu', enrollmentNumber: 'JG2026EC008', department: 'Electronics', semester: '7', cgpa: 7.6, skills: ['Python', 'SQL', 'JavaScript'] },
        { id: 's6', userId: 'u10', fullName: 'Kavya Desai', email: 'kavya@jg.edu', enrollmentNumber: 'JG2026CS042', department: 'Computer Science', semester: '6', cgpa: 8.9, skills: ['Angular', 'JavaScript', 'CSS'] }
      ].map((profile) => ({
        ...profile,
        mobile: '9876543210', location: 'Ahmedabad', about: 'JG University student preparing for the 2026-27 placement season.',
        careerObjective: 'Seeking a graduate placement in software and product engineering.', linkedIn: '', gitHub: '', portfolio: '', profileImage: '',
        academic: { course: 'B.Tech', department: profile.department, semester: profile.semester, cgpa: profile.cgpa, tenthPercentage: 84, twelfthPercentage: 81, backlogs: 0, graduationYear: 2027 },
        skills: profile.skills.map((name) => ({ name, proficiency: 'Advanced' as const })), certificates: [], createdAt: now
      }))
    ];
    const companies: Company[] = [
      {
        id: 'c1', userId: 'u2', name: 'JG Technologies', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80',
        industry: 'Information Technology', location: 'Ahmedabad', website: 'https://jg.edu.in', description: 'Technology company hiring entry-level developers and data analysts.',
        hrName: 'HR Team', hrEmail: 'company@jg.edu', hrPhone: '9999999998', isVerified: true, isApproved: true, createdAt: now
      },
      {
        id: 'c2', userId: 'u6', name: 'CloudWorks', logo: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=400&q=80',
        industry: 'Cloud & DevOps', location: 'Bengaluru', website: 'https://cloudworks.example', description: 'Cloud-native startup focused on automation and modern developer tools.',
        hrName: 'Aisha Khan', hrEmail: 'hr@cloudworks.example', hrPhone: '9876543212', isVerified: true, isApproved: true, createdAt: now
      }
    ];
    const jobs: Job[] = [
      {
        id: 'j1', companyId: 'c1', title: 'Junior Software Developer', description: 'Build responsive web apps and REST APIs for internal business workflows.', location: 'Ahmedabad',
        type: 'Full Time', salary: '₹5 LPA', requiredSkills: ['Python', 'Django', 'SQL'], minimumCGPA: 6.5, eligibleDepartments: ['Information Technology', 'Computer Science'], deadline: '2026-12-31', vacancies: 5,
        status: 'Approved', createdAt: now
      },
      {
        id: 'j2', companyId: 'c2', title: 'Data Analyst Intern', description: 'Analyze product metrics and improve dashboards for customer engagement.', location: 'Remote',
        type: 'Internship', salary: '₹25k/month', requiredSkills: ['SQL', 'Python', 'Power BI'], minimumCGPA: 6.0, eligibleDepartments: ['Computer Science', 'Electronics'], deadline: '2026-11-15', vacancies: 3,
        status: 'Approved', createdAt: now
      },
      { id: 'j3', companyId: 'c1', title: 'Frontend Developer', description: 'Build accessible Angular experiences for JG Technologies products.', location: 'Ahmedabad', type: 'Full Time', salary: '₹4.8 LPA', requiredSkills: ['Angular', 'JavaScript', 'CSS'], minimumCGPA: 6.5, eligibleDepartments: ['Computer Science', 'Information Technology'], deadline: '2026-12-31', vacancies: 4, status: 'Approved', createdAt: now },
      { id: 'j4', companyId: 'c1', title: 'Python Developer', description: 'Develop reliable Django services and REST APIs.', location: 'Hybrid', type: 'Full Time', salary: '₹5.5 LPA', requiredSkills: ['Python', 'Django', 'SQL'], minimumCGPA: 6.5, eligibleDepartments: ['Computer Science', 'Information Technology'], deadline: '2026-12-31', vacancies: 3, status: 'Approved', createdAt: now },
      { id: 'j5', companyId: 'c1', title: 'Data Analyst', description: 'Turn product and placement data into clear reporting insights.', location: 'Ahmedabad', type: 'Full Time', salary: '₹4.5 LPA', requiredSkills: ['SQL', 'Power BI', 'Python'], minimumCGPA: 6.5, eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics'], deadline: '2026-12-31', vacancies: 2, status: 'Approved', createdAt: now },
      { id: 'j6', companyId: 'c1', title: 'Graduate Engineer Trainee', description: 'Join a cross-functional engineering team and learn through product work.', location: 'Gandhinagar', type: 'Full Time', salary: '₹4.2 LPA', requiredSkills: ['Java', 'SQL', 'JavaScript'], minimumCGPA: 6.5, eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics'], deadline: '2026-12-31', vacancies: 5, status: 'Approved', createdAt: now },
      { id: 'j7', companyId: 'c1', title: 'UI Developer Intern', description: 'Support the design systems team with responsive interface development.', location: 'Remote', type: 'Internship', salary: '₹20k/month', requiredSkills: ['Angular', 'JavaScript', 'CSS'], minimumCGPA: 6.0, eligibleDepartments: ['Computer Science', 'Information Technology'], deadline: '2026-11-30', vacancies: 2, status: 'Approved', createdAt: now }
    ];
    const applications: Application[] = [
      { id: 'a1', studentId: 's1', jobId: 'j1', companyId: 'c1', appliedDate: '2026-09-17', status: 'Shortlisted' },
      { id: 'a2', studentId: 's2', jobId: 'j2', companyId: 'c2', appliedDate: '2026-09-18', status: 'Under Review' },
      { id: 'a3', studentId: 's2', jobId: 'j3', companyId: 'c1', appliedDate: '2026-09-19', status: 'Under Review' },
      { id: 'a4', studentId: 's3', jobId: 'j4', companyId: 'c1', appliedDate: '2026-09-20', status: 'Interview Scheduled' },
      { id: 'a5', studentId: 's4', jobId: 'j5', companyId: 'c1', appliedDate: '2026-09-21', status: 'Selected' },
      { id: 'a6', studentId: 's5', jobId: 'j6', companyId: 'c1', appliedDate: '2026-09-22', status: 'Applied' },
      { id: 'a7', studentId: 's6', jobId: 'j7', companyId: 'c1', appliedDate: '2026-09-23', status: 'Shortlisted' }
    ];
    const interviews: Interview[] = [
      { id: 'i1', studentId: 's1', companyId: 'c1', jobId: 'j1', date: '2026-10-08', time: '10:30', mode: 'Online', location: 'Zoom', interviewer: 'R. Mehta', status: 'Scheduled' },
      { id: 'i2', studentId: 's3', companyId: 'c1', jobId: 'j4', date: '2026-10-10', time: '11:00', mode: 'Online', location: 'JG University', interviewer: 'JG Hiring Team', status: 'Scheduled' },
      { id: 'i3', studentId: 's4', companyId: 'c1', jobId: 'j5', date: '2026-10-12', time: '14:00', mode: 'On Campus', location: 'JG University', interviewer: 'JG Hiring Team', status: 'Scheduled' }
    ];
    const offers: Offer[] = [
      { id: 'o1', studentId: 's1', jobId: 'j1', companyId: 'c1', salary: '₹5 LPA', joiningDate: '2027-01-15', offerDate: '2026-09-24', notes: 'Offer letter pending signature.', status: 'Pending' },
      { id: 'o2', studentId: 's4', jobId: 'j5', companyId: 'c1', salary: '₹4.5 LPA', joiningDate: '2027-01-15', offerDate: '2026-09-25', notes: 'Accepted demo offer.', status: 'Accepted' }
    ];
    const notifications: NotificationItem[] = [
      { id: 'n1', userId: 'u1', title: 'Shortlist Update', message: 'You were shortlisted for the JG Technologies interview round.', createdAt: now, read: false },
      { id: 'n2', userId: 'u2', title: 'Application Received', message: 'A new student application was submitted for Junior Software Developer.', createdAt: now, read: false },
      { id: 'n3', userId: 'u1', title: 'JG Placement Drive', message: 'Registration is open for the JG Technologies placement drive on 15 October.', createdAt: '2026-09-28T09:00:00.000Z', read: false },
      { id: 'n4', userId: 'u1', title: 'Resume Review Week', message: 'Book a resume review with the Placement Cell before 12 October.', createdAt: '2026-09-27T09:00:00.000Z', read: false },
      { id: 'n5', userId: 'u1', title: 'Interview Preparation', message: 'A technical interview preparation session is scheduled for this week.', createdAt: '2026-09-26T09:00:00.000Z', read: false },
      { id: 'n6', userId: 'u1', title: 'New Graduate Roles', message: 'Six JG Technologies graduate roles are now open in the student portal.', createdAt: '2026-09-25T09:00:00.000Z', read: false },
      { id: 'n7', userId: 'u1', title: 'Profile Verification', message: 'Please confirm your academic details and contact information before applying.', createdAt: '2026-09-24T09:00:00.000Z', read: false }
    ];
    const placementDrives: PlacementDrive[] = [
      { id: 'pd1', name: 'JG Tech Placement Drive', company: 'JG Technologies', date: '2026-10-15', venue: 'JG University Campus', eligibility: 'CGPA 6.5+, 2027 batch', status: 'Open' }
    ];
    const tickets: Ticket[] = [
      { id: 't1', raisedBy: 'u1', subject: 'Resume verification issue', message: 'The resume validation took longer than expected. Please review it.', status: 'Open' }
    ];
    const auditLogs: AuditLog[] = [
      { id: crypto.randomUUID(), user: 'System', action: 'Portal initialized with demo data.', createdAt: now },
      { id: crypto.randomUUID(), user: 'Admin User', action: 'System seed completed for student and company profiles.', createdAt: now }
    ];
    const departments: Department[] = [
      { id: 'd1', name: 'Computer Science', head: 'Faculty Incharge' },
      { id: 'd2', name: 'Information Technology', head: 'Faculty Incharge' },
      { id: 'd3', name: 'Electronics', head: 'Faculty Incharge' }
    ];
    const certificates: CertificateItem[] = students.flatMap((student) => (student.certificates ?? []).map((certificate) => ({ ...certificate, studentId: student.id })));

    return { users, students, companies, jobs, applications, interviews, offers, certificates, notifications, placementDrives, tickets, auditLogs, departments };
  }

  private ensureState(): PortalState {
    const existing = this.storage.getItem<PortalState>(this.stateKey);
    if (existing) {
      return existing;
    }
    const state = this.defaultState();
    this.storage.setItem(this.stateKey, state);
    return state;
  }

  seedBaseAccounts(): void {
    const existing = this.storage.getItem<PortalState>(this.stateKey);
    if (!existing) {
      this.storage.setItem(this.stateKey, this.defaultState());
      return;
    }

    const freshState = this.defaultState();
    const existingRecord = existing as unknown as Record<keyof PortalState, unknown>;
    const freshRecord = freshState as unknown as Record<keyof PortalState, unknown>;
    const requiredCollections: (keyof PortalState)[] = [
      'users', 'students', 'companies', 'jobs', 'applications', 'interviews', 'offers',
      'certificates', 'notifications', 'placementDrives', 'tickets', 'auditLogs', 'departments'
    ];

    const readCollection = (state: Record<keyof PortalState, unknown>, collection: keyof PortalState): Array<{ id: string }> => {
      const value = state[collection];
      return Array.isArray(value) ? (value as Array<{ id: string }>) : [];
    };

    const hasMinimumSeed = requiredCollections.every((collection) => {
      const current = readCollection(existingRecord, collection);
      const seeded = readCollection(freshRecord, collection);
      return current.length >= seeded.length / 2 || current.length >= 3;
    });

    if (!hasMinimumSeed) {
      this.storage.setItem(this.stateKey, freshState);
      return;
    }

    let changed = false;
    const mergedState = { ...existing } as unknown as Record<keyof PortalState, unknown>;
    for (const collection of requiredCollections) {
      const current = readCollection(existingRecord, collection);
      const seeded = readCollection(freshRecord, collection);
      const existingIds = new Set(current.map((record) => record.id));
      const missingRecords = seeded.filter((record) => !existingIds.has(record.id));
      if (missingRecords.length) {
        mergedState[collection] = [...current, ...missingRecords];
        changed = true;
      }
    }
    if (changed) this.storage.setItem(this.stateKey, mergedState as unknown as PortalState);
  }

  getState(): PortalState {
    return this.ensureState();
  }

  setState(state: PortalState): void {
    this.storage.setItem(this.stateKey, state);
    const token = this.storage.getItem<string>('apiToken');
    if (!token) return;
    this.http.put<PortalState>(`${this.apiUrl}/state/`, state, { headers: { 'X-API-Token': token } }).subscribe({
      error: () => {
        // Keep the local cache intact; the next successful sync will reconcile it.
      }
    });
  }

  getUsers(): User[] { return this.getState().users; }
  getStudents(): Student[] { return this.getState().students; }
  getCompanies(): Company[] { return this.getState().companies; }
  getJobs(): Job[] { return this.getState().jobs; }
  getApplications(): Application[] { return this.getState().applications; }
  getInterviews(): Interview[] { return this.getState().interviews; }
  getOffers(): Offer[] { return this.getState().offers; }
  getCertificates(): CertificateItem[] { return this.getState().certificates; }
  getNotifications(): NotificationItem[] { return this.getState().notifications; }
  getPlacementDrives(): PlacementDrive[] { return this.getState().placementDrives; }
  getTickets(): Ticket[] { return this.getState().tickets; }
  getAuditLogs(): AuditLog[] { return this.getState().auditLogs; }
  getDepartments(): Department[] { return this.getState().departments; }

  pushAudit(action: string, user: string): void {
    const state = this.getState();
    state.auditLogs.unshift({ id: crypto.randomUUID(), user, action, createdAt: new Date().toISOString() });
    this.setState(state);
  }
}
