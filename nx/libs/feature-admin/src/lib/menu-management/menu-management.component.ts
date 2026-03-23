import { Component, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RestaurantRepository } from '@office-lunch/data-access';
import {
  AppButtonComponent,
  AppCardComponent,
  AppModalComponent,
  AppInputComponent,
  AppBadgeComponent,
} from '@office-lunch/shared/ui';
import type { Restaurant, Dish } from '@office-lunch/shared/models';

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [FormsModule, AppButtonComponent, AppCardComponent, AppModalComponent, AppInputComponent, AppBadgeComponent],
  templateUrl: './menu-management.component.html',
  styleUrl: './menu-management.component.scss',
})
export class MenuManagementComponent implements OnInit {
  private readonly restaurantRepo = inject(RestaurantRepository);

  readonly restaurants = signal<Restaurant[]>([]);

  // Add restaurant form
  readonly newRestaurantName = signal('');
  readonly addRestaurantError = signal('');

  get newRestaurantNameValue(): string { return this.newRestaurantName(); }
  set newRestaurantNameValue(v: string) { this.newRestaurantName.set(v); }

  // Add dish modal
  readonly addDishModalOpen = signal(false);
  readonly targetRestaurant = signal<Restaurant | null>(null);
  readonly newDishName = signal('');
  readonly newDishPrice = signal('');
  readonly addDishError = signal('');

  get newDishNameValue(): string { return this.newDishName(); }
  set newDishNameValue(v: string) { this.newDishName.set(v); }

  get newDishPriceValue(): string { return this.newDishPrice(); }
  set newDishPriceValue(v: string) { this.newDishPrice.set(v); }

  // Remove restaurant confirmation modal
  readonly removeModalOpen = signal(false);
  readonly removingRestaurant = signal<Restaurant | null>(null);

  ngOnInit(): void {
    this.loadRestaurants();
  }

  private loadRestaurants(): void {
    this.restaurants.set(this.restaurantRepo.getAll());
  }

  addRestaurant(): void {
    this.addRestaurantError.set('');
    const name = this.newRestaurantName().trim();
    if (!name) {
      this.addRestaurantError.set('Restaurant name is required.');
      return;
    }
    this.restaurantRepo.add({ name, isDisabled: false });
    this.newRestaurantName.set('');
    this.loadRestaurants();
  }

  toggleDisabled(restaurant: Restaurant): void {
    this.restaurantRepo.update({ ...restaurant, isDisabled: !restaurant.isDisabled });
    this.loadRestaurants();
  }

  openAddDish(restaurant: Restaurant): void {
    this.targetRestaurant.set(restaurant);
    this.newDishName.set('');
    this.newDishPrice.set('');
    this.addDishError.set('');
    this.addDishModalOpen.set(true);
  }

  saveAddDish(): void {
    this.addDishError.set('');
    const restaurant = this.targetRestaurant();
    if (!restaurant) return;
    const name = this.newDishName().trim();
    if (!name) {
      this.addDishError.set('Dish name is required.');
      return;
    }
    const priceStr = this.newDishPrice().trim();
    const price = priceStr ? parseFloat(priceStr) : undefined;
    if (priceStr && (isNaN(price!) || price! < 0)) {
      this.addDishError.set('Price must be a positive number.');
      return;
    }
    this.restaurantRepo.addDish(restaurant.id, { name, price });
    this.addDishModalOpen.set(false);
    this.targetRestaurant.set(null);
    this.loadRestaurants();
  }

  closeAddDish(): void {
    this.addDishModalOpen.set(false);
    this.targetRestaurant.set(null);
  }

  openRemove(restaurant: Restaurant): void {
    this.removingRestaurant.set(restaurant);
    this.removeModalOpen.set(true);
  }

  confirmRemove(): void {
    const r = this.removingRestaurant();
    if (r) {
      this.restaurantRepo.remove(r.id);
      this.loadRestaurants();
    }
    this.removeModalOpen.set(false);
    this.removingRestaurant.set(null);
  }

  cancelRemove(): void {
    this.removeModalOpen.set(false);
    this.removingRestaurant.set(null);
  }

  formatDish(dish: Dish): string {
    return !!dish.price ? `${dish.name} — €${dish.price.toFixed(2)}` : dish.name;
  }
}
