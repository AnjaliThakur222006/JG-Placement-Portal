import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-placement-students',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">Students</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <div class="table-responsive">
          <table class="table align-middle">
            <thead><tr><th>Name</th><th>Department</th><th>CGPA</th><th>Skills</th></tr></thead>
            <tbody>
              <tr *ngFor="let student of students">
                <td>{{ student.fullName }}</td>
                <td>{{ student.department }}</td>
                <td>{{ student.academic.cgpa }}</td>
                <td>{{ skillText(student) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class PlacementStudentsComponent {
  students: any[] = [];
  constructor(private data: DataService) {
    this.students = this.data.getStudents();
  }

  skillText(student: any): string {
    return student?.skills?.map((skill: any) => skill.name).join(', ') ?? '';
  }
}
