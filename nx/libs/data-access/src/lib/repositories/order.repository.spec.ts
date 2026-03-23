import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { OrderRepository } from './order.repository';

describe('OrderRepository', () => {
  let repo: OrderRepository;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    repo = TestBed.inject(OrderRepository);
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  // Property 12: Order round-trip
  // Validates: Requirements 7.2
  it('Property 12: submitOrder then getByRound includes matching order', () => {
    fc.assert(
      fc.property(
        fc.record({
          roundId: fc.uuid(),
          userId: fc.uuid(),
          restaurantId: fc.uuid(),
          dishId: fc.uuid(),
        }),
        (orderData) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({});
          repo = TestBed.inject(OrderRepository);

          const submitted = repo.submitOrder(orderData);
          const orders = repo.getByRound(orderData.roundId);

          const found = orders.find((o) => o.id === submitted.id);
          expect(found).toBeDefined();
          expect(found!.userId).toBe(orderData.userId);
          expect(found!.dishId).toBe(orderData.dishId);
          expect(found!.restaurantId).toBe(orderData.restaurantId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 12: getByRound does not return orders from other rounds', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        (roundA, roundB, userId, dishId) => {
          fc.pre(roundA !== roundB);
          localStorage.clear();
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({});
          repo = TestBed.inject(OrderRepository);

          const restaurantId = crypto.randomUUID();
          repo.submitOrder({ roundId: roundA, userId, restaurantId, dishId });
          const ordersB = repo.getByRound(roundB);

          expect(ordersB.every((o) => o.roundId === roundB)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
