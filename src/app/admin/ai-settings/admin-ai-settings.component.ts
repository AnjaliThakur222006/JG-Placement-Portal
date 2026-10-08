import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-ai-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <h2 class="fw-bold mb-4">AI Settings</h2>
      <div class="card border-0 shadow-sm rounded-4 p-4">
        <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" [checked]="settings.recommendations" (change)="settings.recommendations = !settings.recommendations" /><label class="form-check-label">Enable automated recommendations</label></div>
        <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" [checked]="settings.matching" (change)="settings.matching = !settings.matching" /><label class="form-check-label">Enable resume matching</label></div>
        <div class="form-check form-switch"><input class="form-check-input" type="checkbox" [checked]="settings.insights" (change)="settings.insights = !settings.insights" /><label class="form-check-label">Enable interview insights</label></div>
      <button class="btn btn-danger mt-3" (click)="save()">Save AI Settings</button>
      </div>
    </div>
  `,
  styles: ['.container-fluid{background:#f8fafc; min-height:100vh;} .card{background:white;}']
})
export class AdminAiSettingsComponent {
  settings = JSON.parse(localStorage.getItem('aiSettings') || '{"recommendations":true,"matching":true,"insights":true}');
  save(): void { localStorage.setItem('aiSettings', JSON.stringify(this.settings)); }
}
