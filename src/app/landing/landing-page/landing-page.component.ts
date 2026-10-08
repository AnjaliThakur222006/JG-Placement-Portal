import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  features = [
    { icon: 'bi-robot', title: 'Smart Job Matching', text: 'AI-powered recommendations aligning candidate profiles to job requirements.' },
    { icon: 'bi-file-earmark-check', title: 'Resume Score', text: 'Evaluate resumes using structured scoring and profile completeness metrics.' },
    { icon: 'bi-graph-up-arrow', title: 'Skill Gap Analysis', text: 'Identify skill gaps and direct students to role-specific learning paths.' },
    { icon: 'bi-briefcase', title: 'Application Tracking', text: 'Monitor the status of every application from submission to placement.' },
    { icon: 'bi-calendar3', title: 'Interview Management', text: 'Coordinate schedules, modes, and interviewer workflows across teams.' },
    { icon: 'bi-bar-chart', title: 'Placement Analytics', text: 'Track performance, trends and hiring outcomes across departments.' }
  ];

  steps = [
    'Create Profile',
    'Discover Opportunities',
    'Apply',
    'Interview',
    'Get Placed'
  ];

  stats = [
    { label: 'Students', value: '8,500+' },
    { label: 'Companies', value: '180+' },
    { label: 'Jobs', value: '1,200+' },
    { label: 'Placements', value: '92%' }
  ];
}
