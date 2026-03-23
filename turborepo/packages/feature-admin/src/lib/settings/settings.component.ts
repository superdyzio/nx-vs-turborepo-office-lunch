import { Component, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsRepository } from '@office-lunch/data-access';
import { AppButtonComponent } from '@office-lunch/shared-ui';
import { AppCardComponent } from '@office-lunch/shared-ui';
import { AppInputComponent } from '@office-lunch/shared-ui';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, AppButtonComponent, AppCardComponent, AppInputComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly settingsRepo = inject(SettingsRepository);

  readonly lastChoicesCount = signal(5);
  readonly calendarEventName = signal('');
  readonly departureTime = signal('12:00');
  readonly saveSuccess = signal(false);

  get lastChoicesCountValue(): string { return String(this.lastChoicesCount()); }
  set lastChoicesCountValue(v: string) {
    const n = parseInt(v, 10);
    if (!isNaN(n) && n > 0) this.lastChoicesCount.set(n);
  }

  get calendarEventNameValue(): string { return this.calendarEventName(); }
  set calendarEventNameValue(v: string) { this.calendarEventName.set(v); }

  get departureTimeValue(): string { return this.departureTime(); }
  set departureTimeValue(v: string) { this.departureTime.set(v); }

  readonly integrations = [
    { name: 'Wolt', description: 'Order food directly via Wolt integration.' },
    { name: 'Outlook', description: 'Create calendar events in Outlook.' },
    { name: 'Slack', description: 'Send lunch notifications to Slack.' },
    { name: 'Uber Eats', description: 'Order food directly via Uber Eats integration.' },
    { name: 'Google Maps', description: 'Show restaurant location on Google Maps.' },
  ];

  ngOnInit(): void {
    const s = this.settingsRepo.get();
    this.lastChoicesCount.set(s.lastChoicesCount);
    this.calendarEventName.set(s.calendarEventName);
    this.departureTime.set(s.departureTime);
  }

  save(): void {
    this.settingsRepo.update({
      lastChoicesCount: this.lastChoicesCount(),
      calendarEventName: this.calendarEventName(),
      departureTime: this.departureTime(),
    });
    this.saveSuccess.set(true);
    setTimeout(() => this.saveSuccess.set(false), 2500);
  }
}
