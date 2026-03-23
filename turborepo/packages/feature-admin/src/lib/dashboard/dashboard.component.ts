import { Component, inject, signal, type OnInit } from '@angular/core';
import { VoteRepository } from '@office-lunch/data-access';
import { OrderRepository } from '@office-lunch/data-access';
import { UserRepository } from '@office-lunch/data-access';
import { RestaurantRepository } from '@office-lunch/data-access';
import { SessionRepository } from '@office-lunch/data-access';
import { AppTableComponent, type TableColumn } from '@office-lunch/shared-ui';

interface HistoryEntry extends Record<string, unknown> {
  date: string;
  winner: string;
  totalVotes: number;
}

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

  readonly historyColumns: TableColumn[] = [
    { key: 'date', label: 'Date' },
    { key: 'winner', label: 'Winner' },
    { key: 'totalVotes', label: 'Votes' },
  ];

  readonly rows = signal<Record<string, unknown>[]>([]);
  readonly historyRows = signal<Record<string, unknown>[]>([]);
  readonly winnerName = signal('');
  readonly noRound = signal(false);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const lastRound = this.voteRepo.getLastCompletedRound();
    if (!lastRound) {
      this.noRound.set(true);
    } else {
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

    // Load history (all completed rounds except the most recent one shown above)
    const allCompleted = this.voteRepo.getAllCompletedRounds();
    const skipId = this.voteRepo.getLastCompletedRound()?.id;
    const history: HistoryEntry[] = allCompleted
      .filter((r) => r.id !== skipId)
      .map((r) => {
        const restaurant = r.winnerId ? this.restaurantRepo.getById(r.winnerId) : null;
        return {
          date: new Date(r.createdAt).toLocaleDateString(),
          winner: restaurant?.name ?? 'No winner',
          totalVotes: r.votes.length,
        };
      });

    this.historyRows.set(history);
  }
}
