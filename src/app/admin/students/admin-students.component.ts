import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Students</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4"><div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Enrollment</th><th>Department</th></tr></thead><tbody><tr *ngFor="let student of students"><td>{{ student.fullName }}</td><td>{{ student.enrollmentNumber }}</td><td>{{ student.department }}</td></tr></tbody></table></div></div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class AdminStudentsComponent {
  students: any[] = [];
  constructor(private data: DataService) { this.students = this.data.getStudents(); }
}
