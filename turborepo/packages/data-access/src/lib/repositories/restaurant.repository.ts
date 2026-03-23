import { inject, Injectable } from '@angular/core';
import type { Dish, Restaurant } from '@office-lunch/shared-models';
import { LocalStorageService } from '../local-storage.service';

const KEY = 'ol_restaurants';

@Injectable({ providedIn: 'root' })
export class RestaurantRepository {
  private storage = inject(LocalStorageService);

  private load(): Restaurant[] {
    return this.storage.getItem<Restaurant[]>(KEY) ?? [];
  }

  private save(restaurants: Restaurant[]): void {
    this.storage.setItem(KEY, restaurants);
  }

  getAll(): Restaurant[] {
    return this.load();
  }

  getEnabled(): Restaurant[] {
    return this.load().filter((r) => !r.isDisabled);
  }

  getById(id: string): Restaurant | null {
    return this.load().find((r) => r.id === id) ?? null;
  }

  add(restaurant: Omit<Restaurant, 'id' | 'dishes'>): Restaurant {
    const newRestaurant: Restaurant = {
      ...restaurant,
      id: crypto.randomUUID(),
      dishes: [],
    };
    const restaurants = this.load();
    restaurants.push(newRestaurant);
    this.save(restaurants);
    return newRestaurant;
  }

  update(restaurant: Restaurant): void {
    const restaurants = this.load().map((r) =>
      r.id === restaurant.id ? restaurant : r
    );
    this.save(restaurants);
  }

  remove(id: string): void {
    this.save(this.load().filter((r) => r.id !== id));
  }

  addDish(restaurantId: string, dish: Omit<Dish, 'id'>): Dish {
    const newDish: Dish = { ...dish, id: crypto.randomUUID() };
    const restaurants = this.load().map((r) => {
      if (r.id === restaurantId) {
        return { ...r, dishes: [...r.dishes, newDish] };
      }
      return r;
    });
    this.save(restaurants);
    return newDish;
  }
}
