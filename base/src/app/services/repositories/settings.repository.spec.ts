import * as fc from 'fast-check';
import { LocalStorageService } from '../local-storage.service';
import { SettingsRepository } from './settings.repository';

// HH:mm time string generator
const timeString = () =>
  fc
    .tuple(
      fc.integer({ min: 0, max: 23 }),
      fc.integer({ min: 0, max: 59 })
    )
    .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

describe('SettingsRepository', () => {
  let repo: SettingsRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new SettingsRepository(new LocalStorageService());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    const settings = repo.get();
    expect(settings.lastChoicesCount).toBe(5);
    expect(settings.calendarEventName).toBe('');
    expect(settings.departureTime).toBe('12:00');
  });

  // Property 5: Settings round-trip
  // Validates: Requirements 4.2, 4.3, 4.4
  it('Property 5: update then get returns updated values', () => {
    fc.assert(
      fc.property(
        fc.record({
          lastChoicesCount: fc.integer({ min: 1, max: 100 }),
          calendarEventName: fc.string({ maxLength: 100 }),
          departureTime: timeString(),
        }),
        (settings) => {
          localStorage.clear();
          repo = new SettingsRepository(new LocalStorageService());

          repo.update(settings);
          const result = repo.get();

          expect(result.lastChoicesCount).toBe(settings.lastChoicesCount);
          expect(result.calendarEventName).toBe(settings.calendarEventName);
          expect(result.departureTime).toBe(settings.departureTime);
        }
      ),
      { numRuns: 100 }
    );
  });
});
