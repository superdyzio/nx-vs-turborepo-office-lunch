import { Injectable } from '@angular/core';
import { Settings } from '../../models/settings.model';
import { LocalStorageService } from '../local-storage.service';

const KEY = 'ol_settings';

const DEFAULTS: Settings = {
  lastChoicesCount: 5,
  calendarEventName: '',
  departureTime: '12:00',
};

@Injectable({ providedIn: 'root' })
export class SettingsRepository {
  constructor(private storage: LocalStorageService) {}

  get(): Settings {
    const stored = this.storage.getItem<Partial<Settings>>(KEY);
    return { ...DEFAULTS, ...stored };
  }

  update(settings: Partial<Settings>): void {
    const current = this.get();
    this.storage.setItem(KEY, { ...current, ...settings });
  }
}
