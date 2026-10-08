import { Injectable } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: ToastMessage[] = [];

  show(message: string, type: ToastType = 'success'): void {
    const id = Date.now() + Math.random();
    this.toasts.push({ id, message, type });
    window.setTimeout(() => {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    }, 2500);
  }
}
