import { initDb } from './init-db';
import type { User } from '@office-lunch/shared-models';
import type { Restaurant } from '@office-lunch/shared-models';

describe('initDb', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should clear all ol_ keys before seeding', () => {
    localStorage.setItem('ol_votes', JSON.stringify([{ id: 'old-vote' }]));
    localStorage.setItem('ol_orders', JSON.stringify([{ id: 'old-order' }]));
    localStorage.setItem('non_ol_key', 'should remain');

    initDb();

    expect(localStorage.getItem('non_ol_key')).toBe('should remain');
    const votes = localStorage.getItem('ol_votes');
    expect(votes).toBeNull();
  });

  it('should create exactly 6 users (5 regular + 1 admin)', () => {
    initDb();

    const raw = localStorage.getItem('ol_users');
    expect(raw).not.toBeNull();

    const users: User[] = JSON.parse(raw!);
    expect(users.length).toBe(6);

    const admins = users.filter((u) => u.isAdmin);
    const regulars = users.filter((u) => !u.isAdmin);

    expect(admins.length).toBe(1);
    expect(regulars.length).toBe(5);
  });

  it('should create the admin user with username "admin"', () => {
    initDb();

    const users: User[] = JSON.parse(localStorage.getItem('ol_users')!);
    const admin = users.find((u) => u.isAdmin);

    expect(admin).toBeDefined();
    expect(admin!.username).toBe('admin');
    expect(admin!.isDisabled).toBe(false);
  });

  it('should create exactly 7 restaurants with 4 dishes each', () => {
    initDb();

    const raw = localStorage.getItem('ol_restaurants');
    expect(raw).not.toBeNull();

    const restaurants: Restaurant[] = JSON.parse(raw!);
    expect(restaurants.length).toBe(7);

    restaurants.forEach((r) => {
      expect(r.dishes.length).toBe(4);
    });
  });

  it('should assign unique IDs to all users', () => {
    initDb();

    const users: User[] = JSON.parse(localStorage.getItem('ol_users')!);
    const ids = users.map((u) => u.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(users.length);
  });

  it('should assign unique IDs to all restaurants and their dishes', () => {
    initDb();

    const restaurants: Restaurant[] = JSON.parse(
      localStorage.getItem('ol_restaurants')!
    );

    const restaurantIds = restaurants.map((r) => r.id);
    expect(new Set(restaurantIds).size).toBe(restaurants.length);

    const allDishIds = restaurants.flatMap((r) => r.dishes.map((d) => d.id));
    expect(new Set(allDishIds).size).toBe(allDishIds.length);
  });
});
