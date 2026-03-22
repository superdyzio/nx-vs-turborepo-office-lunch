import { computed, inject, Injectable, signal } from '@angular/core';
import type { User } from '../models/user.model';
import { LocalStorageService } from './local-storage.service';
import { UserRepository } from './repositories/user.repository';

const CURRENT_USER_KEY = 'ol_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(LocalStorageService);
  private readonly userRepo = inject(UserRepository);

  readonly currentUser = signal<User | null>(null);
  readonly isAdmin = computed(() => this.currentUser()?.isAdmin === true);

  constructor() {
    this.seedDefaultAdmin();
    this.restoreSession();
  }

  login(username: string, password: string): boolean {
    const user = this.userRepo.findByUsername(username);
    if (!user || user.password !== password || user.isDisabled) {
      return false;
    }
    this.currentUser.set(user);
    this.storage.setItem(CURRENT_USER_KEY, user.id);
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
    this.storage.removeItem(CURRENT_USER_KEY);
  }

  private restoreSession(): void {
    const userId = this.storage.getItem<string>(CURRENT_USER_KEY);
    if (!userId) return;
    const user = this.userRepo.getById(userId);
    if (user && !user.isDisabled) {
      this.currentUser.set(user);
    }
  }

  private seedDefaultAdmin(): void {
    const users = this.userRepo.getAll();
    if (users.length === 0) {
      const admin = this.userRepo.add({
        username: 'admin',
        isAdmin: true,
        isDisabled: false,
      });
      // Override the default "lunch" password with "admin"
      this.userRepo.update({ ...admin, password: 'admin' });
    }
  }
}
