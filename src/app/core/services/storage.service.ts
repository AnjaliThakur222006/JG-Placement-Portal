import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefix = 'jg_portal_';

  setItem<T>(key: string, value: T): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  getItem<T>(key: string): T | null {
    const raw = localStorage.getItem(this.prefix + key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
}
