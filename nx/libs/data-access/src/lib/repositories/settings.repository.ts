import { inject, Injectable } from '@angular/core';
import type { Settings } from '@office-lunch/shared/models';
import { LocalStorageService } from '../local-storage.service';

const KEY = 'ol_settings';

const DEFAULTS: Settings = {
  lastChoicesCount: 5,
  calendarEventName: '',
  departureTime: '12:00',
};

@Injectable({ providedIn: 'root' })
export class SettingsRepository {
  private storage = inject(LocalStorageService);

  get(): Settings {
    const stored = this.storage.getItem<Partial<Settings>>(KEY);
    return { ...DEFAULTS, ...stored };
  }

  update(settings: Partial<Settings>): void {
    const current = this.get();
    this.storage.setItem(KEY, { ...current, ...settings });
  }
}
