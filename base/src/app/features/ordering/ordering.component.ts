import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RestaurantRepository } from '../../services/repositories/restaurant.repository';
import { OrderRepository } from '../../services/repositories/order.repository';
import { VoteRepository } from '../../services/repositories/vote.repository';
import { SessionRepository } from '../../services/repositories/session.repository';
import { AppButtonComponent } from '../../shared/components/button/app-button.component';
import { AppBadgeComponent } from '../../shared/components/badge/app-badge.component';
import type { Dish, Restaurant } from '../../models/restaurant.model';

@Component({
  selector: 'app-ordering',
  standalone: true,
  imports: [AppButtonComponent, AppBadgeComponent],
  templateUrl: './ordering.component.html',
  styleUrl: './ordering.component.scss',
})
export class OrderingComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly restaurantRepo = inject(RestaurantRepository);
  private readonly orderRepo = inject(OrderRepository);
  private readonly voteRepo = inject(VoteRepository);
  private readonly sessionRepo = inject(SessionRepository);

  readonly currentUser = computed(() => this.auth.currentUser());

  readonly winningRestaurant = signal<Restaurant | null>(null);
  readonly dishes = signal<Dish[]>([]);
  readonly selectedDish = signal<Dish | null>(null);
  readonly orderSubmitted = signal(false);
  readonly mustOrder = signal(false);
  readonly noWinner = signal(false);
  readonly votingOngoing = signal(false);

  private currentRoundId = '';

  ngOnInit(): void {
    this.votingOngoing.set(!!this.voteRepo.getCurrentRound());

    const lastRound = this.voteRepo.getLastCompletedRound();
    if (!lastRound?.winnerId) {
      this.noWinner.set(true);
      return;
    }

    this.currentRoundId = lastRound.id;

    const restaurant = this.restaurantRepo.getById(lastRound.winnerId);
    if (!restaurant) {
      this.noWinner.set(true);
      return;
    }

    this.winningRestaurant.set(restaurant);
    this.dishes.set(restaurant.dishes);

    const user = this.currentUser();
    if (user) {
      const departure = this.sessionRepo.getDepartureResponse(user.id);
      this.mustOrder.set(departure?.canLeave === false);

      // Check if user already placed an order for this round
      const existing = this.orderRepo.getByRound(lastRound.id)
        .find((o) => o.userId === user.id);
      if (existing) {
        const dish = restaurant.dishes.find((d) => d.id === existing.dishId) ?? null;
        this.selectedDish.set(dish);
        this.orderSubmitted.set(true);
      }
    }
  }

  selectDish(dish: Dish): void {
    if (!this.orderSubmitted()) {
      this.selectedDish.set(dish);
    }
  }

  submitOrder(): void {
    const user = this.currentUser();
    const dish = this.selectedDish();
    const restaurant = this.winningRestaurant();

    if (!user || !dish || !restaurant || this.orderSubmitted()) return;

    this.orderRepo.submitOrder({
      roundId: this.currentRoundId,
      userId: user.id,
      restaurantId: restaurant.id,
      dishId: dish.id,
    });

    this.orderSubmitted.set(true);
  }

  /** Whether the user is allowed to navigate away (enforced when mustOrder and not yet ordered) */
  canNavigateAway(): boolean {
    return !this.mustOrder() || this.orderSubmitted();
  }
}
