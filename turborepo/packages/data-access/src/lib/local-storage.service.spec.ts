import * as fc from 'fast-check';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    service = new LocalStorageService();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Unit tests
  it('should return null for a missing key', () => {
    expect(service.getItem('ol_missing')).toBeNull();
  });

  it('should return null and not throw for corrupted JSON', () => {
    localStorage.setItem('ol_bad', '{not valid json}');
    expect(service.getItem('ol_bad')).toBeNull();
  });

  it('should only clear ol_ prefixed keys', () => {
    service.setItem('ol_a', 1);
    service.setItem('ol_b', 2);
    localStorage.setItem('other_key', 'keep');
    service.clear();
    expect(service.getItem('ol_a')).toBeNull();
    expect(service.getItem('ol_b')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('keep');
  });

  // Property 14: LocalStorage service round-trip
  // Validates: Requirements 8.1
  // Note: fc.jsonValue() is filtered to exclude -0 because JSON.stringify(-0) === "0",
  // meaning -0 cannot survive a JSON round-trip. This is a JS/JSON spec limitation.
  const jsonValueNoNegZero = fc.jsonValue().filter(
    (v) => !(typeof v === 'number' && Object.is(v, -0))
  );

  it('Property 14: setItem then getItem returns deeply equal value', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map((s) => `ol_${s}`),
        jsonValueNoNegZero,
        (key, value) => {
          service.setItem(key, value);
          const result = service.getItem(key);
          expect(result).toEqual(value);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14: removeItem then getItem returns null', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).map((s) => `ol_${s}`),
        jsonValueNoNegZero,
        (key, value) => {
          service.setItem(key, value);
          service.removeItem(key);
          expect(service.getItem(key)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
