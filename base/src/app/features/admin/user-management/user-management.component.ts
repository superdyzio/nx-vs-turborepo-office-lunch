import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserRepository } from '../../../services/repositories/user.repository';
import { AuthService } from '../../../services/auth.service';
import { AppButtonComponent } from '../../../shared/components/button/app-button.component';
import { AppBadgeComponent } from '../../../shared/components/badge/app-badge.component';
import { AppModalComponent } from '../../../shared/components/modal/app-modal.component';
import { AppInputComponent } from '../../../shared/components/input/app-input.component';
import type { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule, AppButtonComponent, AppBadgeComponent, AppModalComponent, AppInputComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  private readonly userRepo = inject(UserRepository);
  private readonly auth = inject(AuthService);

  readonly currentUser = computed(() => this.auth.currentUser());

  readonly users = signal<User[]>([]);

  // Add user form
  readonly newUsername = signal('');
  readonly addError = signal('');

  get newUsernameValue(): string { return this.newUsername(); }
  set newUsernameValue(v: string) { this.newUsername.set(v); }

  // Edit modal
  readonly editModalOpen = signal(false);
  readonly editingUser = signal<User | null>(null);
  readonly editUsername = signal('');
  readonly editIsAdmin = signal(false);
  readonly editError = signal('');

  get editUsernameValue(): string { return this.editUsername(); }
  set editUsernameValue(v: string) { this.editUsername.set(v); }

  get editIsAdminValue(): boolean { return this.editIsAdmin(); }
  set editIsAdminValue(v: boolean) { this.editIsAdmin.set(v); }

  // Remove confirmation modal
  readonly removeModalOpen = signal(false);
  readonly removingUser = signal<User | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.users.set(this.userRepo.getAll());
  }

  getBadgeColor(user: User): 'green' | 'red' | 'gray' {
    if (user.isDisabled) return 'red';
    if (user.isAdmin) return 'gray';
    return 'green';
  }

  getBadgeText(user: User): string {
    if (user.isDisabled) return 'Disabled';
    if (user.isAdmin) return 'Admin';
    return 'Active';
  }

  addUser(): void {
    this.addError.set('');
    const username = this.newUsername().trim();
    if (!username) {
      this.addError.set('Username is required.');
      return;
    }
    if (this.userRepo.findByUsername(username)) {
      this.addError.set('Username already exists.');
      return;
    }
    this.userRepo.add({ username, isAdmin: false, isDisabled: false });
    this.newUsername.set('');
    this.loadUsers();
  }

  openEdit(user: User): void {
    this.editingUser.set(user);
    this.editUsername.set(user.username);
    this.editIsAdmin.set(user.isAdmin);
    this.editError.set('');
    this.editModalOpen.set(true);
  }

  saveEdit(): void {
    this.editError.set('');
    const user = this.editingUser();
    if (!user) return;
    const username = this.editUsername().trim();
    if (!username) {
      this.editError.set('Username is required.');
      return;
    }
    const existing = this.userRepo.findByUsername(username);
    if (existing && existing.id !== user.id) {
      this.editError.set('Username already exists.');
      return;
    }
    this.userRepo.update({ ...user, username, isAdmin: this.editIsAdmin() });
    this.editModalOpen.set(false);
    this.editingUser.set(null);
    this.loadUsers();
  }

  closeEdit(): void {
    this.editModalOpen.set(false);
    this.editingUser.set(null);
  }

  toggleDisabled(user: User): void {
    this.userRepo.update({ ...user, isDisabled: !user.isDisabled });
    this.loadUsers();
  }

  openRemove(user: User): void {
    this.removingUser.set(user);
    this.removeModalOpen.set(true);
  }

  confirmRemove(): void {
    const user = this.removingUser();
    if (user) {
      this.userRepo.remove(user.id);
      this.loadUsers();
    }
    this.removeModalOpen.set(false);
    this.removingUser.set(null);
  }

  cancelRemove(): void {
    this.removeModalOpen.set(false);
    this.removingUser.set(null);
  }

  isSelf(user: User): boolean {
    return this.currentUser()?.id === user.id;
  }
}
