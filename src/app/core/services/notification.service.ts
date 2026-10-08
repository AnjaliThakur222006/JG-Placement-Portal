import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor() {}

  createUserNotification(userId: string, title: string, message: string): { title: string; message: string } {
    return { title, message };
  }
}
