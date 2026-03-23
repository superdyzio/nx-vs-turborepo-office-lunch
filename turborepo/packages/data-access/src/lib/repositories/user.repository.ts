import { inject, Injectable } from '@angular/core';
import type { User } from '@office-lunch/shared-models';
import { LocalStorageService } from '../local-storage.service';

const KEY = 'ol_users';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private storage = inject(LocalStorageService);

  private load(): User[] {
    return this.storage.getItem<User[]>(KEY) ?? [];
  }

  private save(users: User[]): void {
    this.storage.setItem(KEY, users);
  }

  getAll(): User[] {
    return this.load();
  }

  getById(id: string): User | null {
    return this.load().find((u) => u.id === id) ?? null;
  }

  findByUsername(username: string): User | null {
    return this.load().find((u) => u.username === username) ?? null;
  }

  add(user: Omit<User, 'id' | 'password'>): User {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      password: 'lunch',
    };
    const users = this.load();
    users.push(newUser);
    this.save(users);
    return newUser;
  }

  update(user: User): void {
    const users = this.load().map((u) => (u.id === user.id ? user : u));
    this.save(users);
  }

  remove(id: string): void {
    this.save(this.load().filter((u) => u.id !== id));
  }
}
