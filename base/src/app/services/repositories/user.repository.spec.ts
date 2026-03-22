import * as fc from 'fast-check';
import { LocalStorageService } from '../local-storage.service';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new UserRepository(new LocalStorageService());
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Property 2: User CRUD round-trip
  // Validates: Requirements 2.1, 2.2, 2.4
  it('Property 2: add → getById returns same data with password "lunch"', () => {
    fc.assert(
      fc.property(
        fc.record({
          username: fc.string({ minLength: 1, maxLength: 30 }),
          isAdmin: fc.boolean(),
          isDisabled: fc.boolean(),
        }),
        (userData) => {
          localStorage.clear();
          repo = new UserRepository(new LocalStorageService());

          const created = repo.add(userData);
          const fetched = repo.getById(created.id);

          expect(fetched).not.toBeNull();
          expect(fetched!.username).toBe(userData.username);
          expect(fetched!.isAdmin).toBe(userData.isAdmin);
          expect(fetched!.isDisabled).toBe(userData.isDisabled);
          expect(fetched!.password).toBe('lunch');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: update → getById returns updated data', () => {
    fc.assert(
      fc.property(
        fc.record({
          username: fc.string({ minLength: 1, maxLength: 30 }),
          isAdmin: fc.boolean(),
          isDisabled: fc.boolean(),
        }),
        fc.record({
          username: fc.string({ minLength: 1, maxLength: 30 }),
          isAdmin: fc.boolean(),
          isDisabled: fc.boolean(),
        }),
        (initial, updated) => {
          localStorage.clear();
          repo = new UserRepository(new LocalStorageService());

          const created = repo.add(initial);
          repo.update({ ...created, ...updated });
          const fetched = repo.getById(created.id);

          expect(fetched!.username).toBe(updated.username);
          expect(fetched!.isAdmin).toBe(updated.isAdmin);
          expect(fetched!.isDisabled).toBe(updated.isDisabled);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: remove → getById returns null', () => {
    fc.assert(
      fc.property(
        fc.record({
          username: fc.string({ minLength: 1, maxLength: 30 }),
          isAdmin: fc.boolean(),
          isDisabled: fc.boolean(),
        }),
        (userData) => {
          localStorage.clear();
          repo = new UserRepository(new LocalStorageService());

          const created = repo.add(userData);
          repo.remove(created.id);
          expect(repo.getById(created.id)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
