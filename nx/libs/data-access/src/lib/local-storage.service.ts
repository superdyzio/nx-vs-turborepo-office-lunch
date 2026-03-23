import { Injectable } from '@angular/core';

const KEY_PREFIX = 'ol_';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  getItem<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      console.error(`LocalStorageService: failed to parse key "${key}"`);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        throw new Error(
          'Storage quota exceeded. Please clear your browser data and try again.'
        );
      }
      throw err;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /** Removes all keys that start with the ol_ prefix */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(KEY_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}
