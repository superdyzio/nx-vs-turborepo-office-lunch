import { Component, computed, inject, type OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@office-lunch/auth';
import { SettingsRepository, SessionRepository } from '@office-lunch/data-access';
import { AppButtonComponent, AppInputComponent } from '@office-lunch/shared/ui';

@Component({
  selector: 'app-departure',
  standalone: true,
  imports: [FormsModule, AppButtonComponent, AppInputComponent],
  templateUrl: './departure.component.html',
  styleUrl: './departure.component.scss',
})
export class DepartureComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly settings = inject(SettingsRepository);
  private readonly session = inject(SessionRepository);
  private readonly router = inject(Router);

  readonly departureTime = computed(() => this.settings.get().departureTime);
  readonly canLeave = signal<boolean | null>(null);
  readonly alternativeTime = signal('');

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user && this.session.getDepartureResponse(user.id)) {
      this.router.navigate(['/voting']);
    }
  }

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
