import * as fc from 'fast-check';
import { LocalStorageService } from '../local-storage.service';
import { RestaurantRepository } from './restaurant.repository';

const restaurantData = () =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 40 }),
    isDisabled: fc.boolean(),
  });

describe('RestaurantRepository', () => {
  let repo: RestaurantRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new RestaurantRepository(new LocalStorageService());
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Property 3: Restaurant enable/disable filtering
  // Validates: Requirements 3.1, 3.3, 3.4
  it('Property 3: getEnabled returns exactly restaurants with isDisabled===false', () => {
    fc.assert(
      fc.property(
        fc.array(restaurantData(), { minLength: 1, maxLength: 10 }),
        (restaurantList) => {
          localStorage.clear();
          repo = new RestaurantRepository(new LocalStorageService());

          restaurantList.forEach((r) => repo.add(r));

          const enabled = repo.getEnabled();
          const all = repo.getAll();

          const expectedEnabled = all.filter((r) => !r.isDisabled);
          expect(enabled.length).toBe(expectedEnabled.length);
          enabled.forEach((r) => expect(r.isDisabled).toBe(false));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: disabling a restaurant removes it from getEnabled', () => {
    fc.assert(
      fc.property(
        fc.record({ name: fc.string({ minLength: 1, maxLength: 40 }) }),
        (data) => {
          localStorage.clear();
          repo = new RestaurantRepository(new LocalStorageService());

          const created = repo.add({ ...data, isDisabled: false });
          expect(repo.getEnabled().some((r) => r.id === created.id)).toBe(true);

          repo.update({ ...created, isDisabled: true });
          expect(repo.getEnabled().some((r) => r.id === created.id)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: enabling a restaurant adds it back to getEnabled', () => {
    fc.assert(
      fc.property(
        fc.record({ name: fc.string({ minLength: 1, maxLength: 40 }) }),
        (data) => {
          localStorage.clear();
          repo = new RestaurantRepository(new LocalStorageService());

          const created = repo.add({ ...data, isDisabled: true });
          expect(repo.getEnabled().some((r) => r.id === created.id)).toBe(false);

          repo.update({ ...created, isDisabled: false });
          expect(repo.getEnabled().some((r) => r.id === created.id)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 4: Dish management round-trip
  // Validates: Requirements 3.2
  it('Property 4: addDish then getById includes that dish', () => {
    fc.assert(
      fc.property(
        fc.record({ name: fc.string({ minLength: 1, maxLength: 40 }) }),
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 40 }),
          price: fc.option(fc.float({ min: 0, max: 100, noNaN: true }), { nil: undefined }),
        }),
        (restaurantData, dishData) => {
          localStorage.clear();
          repo = new RestaurantRepository(new LocalStorageService());

          const restaurant = repo.add({ ...restaurantData, isDisabled: false });
          const dish = repo.addDish(restaurant.id, dishData);
          const fetched = repo.getById(restaurant.id);

          expect(fetched).not.toBeNull();
          const foundDish = fetched!.dishes.find((d) => d.id === dish.id);
          expect(foundDish).toBeDefined();
          expect(foundDish!.name).toBe(dishData.name);
        }
      ),
      { numRuns: 100 }
    );
  });
});
