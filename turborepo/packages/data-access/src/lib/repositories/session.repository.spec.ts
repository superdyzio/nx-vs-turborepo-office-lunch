import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { SessionRepository } from './session.repository';

const timeString = () =>
  fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

describe('SessionRepository', () => {
  let repo: SessionRepository;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    repo = TestBed.inject(SessionRepository);
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
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
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({});
          repo = TestBed.inject(SessionRepository);

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
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({});
          repo = TestBed.inject(SessionRepository);

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
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({});
          repo = TestBed.inject(SessionRepository);

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

describe('SessionRepository - Property 13', () => {
  let repo: SessionRepository;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    repo = TestBed.inject(SessionRepository);
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  // Property 13: Order requirement based on departure status
  // Validates: Requirements 7.3, 7.4
  // For any user, ordering is required iff canLeave===false
  it('Property 13: ordering is required iff canLeave is false', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.boolean(),
        (userId, canLeave) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({});
          repo = TestBed.inject(SessionRepository);

          const response = { userId, canLeave };
          repo.setDepartureResponse(userId, response);
          const stored = repo.getDepartureResponse(userId);

          expect(stored).not.toBeNull();
          // Ordering is required iff canLeave === false
          const orderingRequired = stored!.canLeave === false;
          expect(orderingRequired).toBe(!canLeave);
        }
      ),
      { numRuns: 100 }
    );
  });
});
