export type Role = 'Student' | 'Company' | 'Placement' | 'Admin';

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface SkillItem {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AcademicRecord {
  course: string;
  department: string;
  semester: string;
  cgpa: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  backlogs: number;
  graduationYear: number;
}

export interface ResumeMeta {
  fileName: string;
  uploadedAt: string;
  status: 'Uploaded' | 'Flagged' | 'Verified';
  score?: number;
  suggestions?: string[];
}

export interface CertificateItem {
  id: string;
  studentId?: string;
  name: string;
  issuingOrganization: string;
  date: string;
  credentialId: string;
  credentialLink: string;
  fileName?: string;
  status?: 'Pending' | 'Verified' | 'Rejected' | 'Flagged';
}

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  enrollmentNumber: string;
  department: string;
  semester: string;
  mobile: string;
  location: string;
  about: string;
  careerObjective: string;
  linkedIn: string;
  gitHub: string;
  portfolio: string;
  profileImage: string;
  academic: AcademicRecord;
  skills: SkillItem[];
  resume?: ResumeMeta;
  certificates: CertificateItem[];
  createdAt: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  hrName: string;
  hrEmail: string;
  hrPhone: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary: string;
  requiredSkills: string[];
  minimumCGPA: number;
  eligibleDepartments: string[];
  deadline: string;
  vacancies: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Closed';
  createdAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  companyId: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected';
}

export interface Interview {
  id: string;
  studentId: string;
  companyId: string;
  jobId: string;
  date: string;
  time: string;
  mode: string;
  location: string;
  interviewer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface Offer {
  id: string;
  studentId: string;
  jobId: string;
  companyId: string;
  salary: string;
  joiningDate: string;
  offerDate: string;
  notes: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  createdAt: string;
}

export interface PlacementDrive {
  id: string;
  name: string;
  company: string;
  date: string;
  venue: string;
  eligibility: string;
  status: string;
}

export interface Ticket {
  id: string;
  raisedBy: string;
  subject: string;
  message: string;
  status: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
}

export interface PortalState {
  users: User[];
  students: Student[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  offers: Offer[];
  certificates: CertificateItem[];
  notifications: NotificationItem[];
  placementDrives: PlacementDrive[];
  tickets: Ticket[];
  auditLogs: AuditLog[];
  departments: Department[];
}
