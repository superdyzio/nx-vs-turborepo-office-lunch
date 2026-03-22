import { Component, inject, signal, type OnInit } from '@angular/core';
import { VoteRepository } from '../../../services/repositories/vote.repository';
import { OrderRepository } from '../../../services/repositories/order.repository';
import { UserRepository } from '../../../services/repositories/user.repository';
import { RestaurantRepository } from '../../../services/repositories/restaurant.repository';
import { SessionRepository } from '../../../services/repositories/session.repository';
import { AppTableComponent, type TableColumn } from '../../../shared/components/table/app-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AppTableComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly voteRepo = inject(VoteRepository);
  private readonly orderRepo = inject(OrderRepository);
  private readonly userRepo = inject(UserRepository);
  private readonly restaurantRepo = inject(RestaurantRepository);
  private readonly sessionRepo = inject(SessionRepository);

  readonly columns: TableColumn[] = [
    { key: 'username', label: 'User' },
    { key: 'dish', label: 'Dish' },
    { key: 'departure', label: 'Departure Status' },
  ];

  readonly rows = signal<Record<string, unknown>[]>([]);
  readonly winnerName = signal('');
  readonly noRound = signal(false);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const lastRound = this.voteRepo.getLastCompletedRound();
    if (!lastRound) {
      this.noRound.set(true);
      return;
    }

    const restaurant = lastRound.winnerId
      ? this.restaurantRepo.getById(lastRound.winnerId)
      : null;
    this.winnerName.set(restaurant?.name ?? 'No winner');

    const orders = this.orderRepo.getByRound(lastRound.id);
    const allResponses = this.sessionRepo.getAllResponses();

    const tableRows: Record<string, unknown>[] = orders.map((order) => {
      const user = this.userRepo.getById(order.userId);
      const dish = restaurant?.dishes.find((d) => d.id === order.dishId);
      const departure = allResponses.find((r) => r.userId === order.userId);

      let departureLabel: string;
      if (!departure) {
        departureLabel = 'Unknown';
      } else if (departure.canLeave) {
        departureLabel = 'On time';
      } else {
        departureLabel = departure.alternativeTime
          ? `Late (${departure.alternativeTime})`
          : 'Late';
      }

      return {
        username: user?.username ?? order.userId,
        dish: dish?.name ?? order.dishId,
        departure: departureLabel,
      };
    });

    this.rows.set(tableRows);
  }
}
