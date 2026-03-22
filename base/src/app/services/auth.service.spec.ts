import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './auth.service';

function makeAuthService(): { auth: AuthService; userRepo: UserRepository } {
  TestBed.configureTestingModule({});
  const auth = TestBed.inject(AuthService);
  const userRepo = TestBed.inject(UserRepository);
  return { auth, userRepo };
}

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  // Property 1: Login succeeds iff credentials match non-disabled user
  // Validates: Requirements 1.2, 1.3, 2.3
  it('Property 1: login returns true iff matching non-disabled user exists', () => {
    fc.assert(
      fc.property(
        fc.record({
          username: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s !== 'admin'),
          password: fc.string({ minLength: 1, maxLength: 20 }),
          isAdmin: fc.boolean(),
          isDisabled: fc.boolean(),
        }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (userData, attemptedPassword) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { auth, userRepo } = makeAuthService();

          // Add user then set the exact password we want to test
          const created = userRepo.add({
            username: userData.username,
            isAdmin: userData.isAdmin,
            isDisabled: userData.isDisabled,
          });
          userRepo.update({ ...created, password: userData.password });

          const result = auth.login(userData.username, attemptedPassword);
          const shouldSucceed =
            attemptedPassword === userData.password && !userData.isDisabled;

          expect(result).toBe(shouldSucceed);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: login with non-existent username always returns false', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s !== 'admin'),
        fc.string({ minLength: 1, maxLength: 20 }),
        (username, password) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { auth } = makeAuthService();
          // No users added — only the seeded admin exists
          // Login with a non-admin username should always fail
          const result = auth.login(username, password);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });
});
