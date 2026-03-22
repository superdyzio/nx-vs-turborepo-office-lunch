import * as fc from 'fast-check';
import { LocalStorageService } from '../local-storage.service';
import { SessionRepository } from './session.repository';

const timeString = () =>
  fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

describe('SessionRepository', () => {
  let repo: SessionRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new SessionRepository(new LocalStorageService());
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Property 6: Departure response round-trip
  // Validates: Requirements 5.2, 5.4
  it('Property 6: setDepartureResponse then getDepartureResponse returns equivalent response (canLeave=true)', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constant(true),
        (userId, canLeave) => {
          localStorage.clear();
          repo = new SessionRepository(new LocalStorageService());

          const response = { userId, canLeave };
          repo.setDepartureResponse(userId, response);
          const result = repo.getDepartureResponse(userId);

          expect(result).not.toBeNull();
          expect(result!.userId).toBe(userId);
          expect(result!.canLeave).toBe(canLeave);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: setDepartureResponse then getDepartureResponse returns equivalent response (canLeave=false with alternativeTime)', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        timeString(),
        (userId, alternativeTime) => {
          localStorage.clear();
          repo = new SessionRepository(new LocalStorageService());

          const response = { userId, canLeave: false, alternativeTime };
          repo.setDepartureResponse(userId, response);
          const result = repo.getDepartureResponse(userId);

          expect(result).not.toBeNull();
          expect(result!.canLeave).toBe(false);
          expect(result!.alternativeTime).toBe(alternativeTime);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: overwriting a response replaces the previous one', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.boolean(),
        fc.boolean(),
        (userId, first, second) => {
          localStorage.clear();
          repo = new SessionRepository(new LocalStorageService());

          repo.setDepartureResponse(userId, { userId, canLeave: first });
          repo.setDepartureResponse(userId, { userId, canLeave: second });

          const all = repo.getAllResponses().filter((r) => r.userId === userId);
          expect(all.length).toBe(1);
          expect(all[0].canLeave).toBe(second);
        }
      ),
      { numRuns: 100 }
    );
  });
});
