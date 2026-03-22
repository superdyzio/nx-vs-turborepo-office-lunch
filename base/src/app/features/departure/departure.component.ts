import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SettingsRepository } from '../../services/repositories/settings.repository';
import { SessionRepository } from '../../services/repositories/session.repository';
import { AppButtonComponent } from '../../shared/components/button/app-button.component';
import { AppInputComponent } from '../../shared/components/input/app-input.component';

@Component({
  selector: 'app-departure',
  standalone: true,
  imports: [FormsModule, AppButtonComponent, AppInputComponent],
  templateUrl: './departure.component.html',
  styleUrl: './departure.component.scss',
})
export class DepartureComponent {
  private readonly auth = inject(AuthService);
  private readonly settings = inject(SettingsRepository);
  private readonly session = inject(SessionRepository);
  private readonly router = inject(Router);

  readonly departureTime = computed(() => this.settings.get().departureTime);
  readonly canLeave = signal<boolean | null>(null);
  readonly alternativeTime = signal('');

  onYes(): void {
    this.canLeave.set(true);
  }

  onNo(): void {
    this.canLeave.set(false);
  }

  onSubmit(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const response = this.canLeave()
      ? { userId: user.id, canLeave: true }
      : { userId: user.id, canLeave: false, alternativeTime: this.alternativeTime() };

    this.session.setDepartureResponse(user.id, response);
    this.router.navigate(['/voting']);
  }
}
