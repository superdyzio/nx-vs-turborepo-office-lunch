import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RestaurantRepository } from '../../services/repositories/restaurant.repository';
import { VoteRepository } from '../../services/repositories/vote.repository';
import { SettingsRepository } from '../../services/repositories/settings.repository';
import { AppButtonComponent } from '../../shared/components/button/app-button.component';
import { AppBadgeComponent } from '../../shared/components/badge/app-badge.component';
import type { Restaurant } from '../../models/restaurant.model';
import type { VotingResult } from '../../models/voting.model';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [FormsModule, AppButtonComponent, AppBadgeComponent],
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.scss',
})
export class VotingComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly restaurantRepo = inject(RestaurantRepository);
  private readonly voteRepo = inject(VoteRepository);
  private readonly settingsRepo = inject(SettingsRepository);
  private readonly router = inject(Router);

  readonly currentUser = computed(() => this.auth.currentUser());
  readonly isAdmin = computed(() => this.auth.isAdmin());

  readonly restaurants = signal<Restaurant[]>([]);
  readonly lastChoices = signal<string[]>([]);
  readonly lastChoiceNames = signal<string[]>([]);

  readonly roundActive = signal(false);
  readonly hasVoted = signal(false);
  readonly result = signal<VotingResult | null>(null);

  // Vote form state: maps point value (3, 2, 1) to selected restaurantId
  readonly pick3 = signal('');
  readonly pick2 = signal('');
  readonly pick1 = signal('');
  readonly vetoId = signal('');

  readonly voteError = signal('');

  readonly winnerName = computed(() => {
    const r = this.result();
    if (!r?.winnerId) return '';
    return this.restaurants().find((x) => x.id === r.winnerId)?.name ?? r.winnerId;
  });

  ngOnInit(): void {
    this.refresh();
  }

  private refresh(): void {
    const enabled = this.restaurantRepo.getEnabled();
    this.restaurants.set(enabled);

    const settings = this.settingsRepo.get();
    const choices = this.voteRepo.getLastChoices(settings.lastChoicesCount);
    this.lastChoices.set(choices);
    this.lastChoiceNames.set(
      choices.map(
        (id) => this.restaurantRepo.getById(id)?.name ?? id
      )
    );

    const round = this.voteRepo.getCurrentRound();
    this.roundActive.set(!!round);

    if (round) {
      const userId = this.currentUser()?.id;
      this.hasVoted.set(!!userId && round.votes.some((v) => v.userId === userId));
      this.result.set(null);
    }
  }

  canSubmitVote(): boolean {
    const ids = [this.pick3(), this.pick2(), this.pick1()].filter(Boolean);
    if (ids.length !== 3) return false;
    return new Set(ids).size === 3;
  }

  submitVote(): void {
    this.voteError.set('');
    const userId = this.currentUser()?.id;
    if (!userId) return;

    const allocations = [
      { restaurantId: this.pick3(), points: 3 },
      { restaurantId: this.pick2(), points: 2 },
      { restaurantId: this.pick1(), points: 1 },
    ];

    const accepted = this.voteRepo.submitVote(userId, { userId, allocations });
    if (!accepted) {
      this.voteError.set('Vote rejected. Ensure you pick 3 distinct restaurants with points 3, 2, 1.');
      return;
    }

    const vetoTarget = this.vetoId();
    if (vetoTarget) {
      this.voteRepo.submitVeto(userId, vetoTarget);
    }

    this.hasVoted.set(true);
  }

  startRound(): void {
    this.voteRepo.startRound();
    this.result.set(null);
    this.pick3.set('');
    this.pick2.set('');
    this.pick1.set('');
    this.vetoId.set('');
    this.voteError.set('');
    this.refresh();
  }

  endRound(): void {
    const res = this.voteRepo.endRound();
    this.result.set(res);
    this.roundActive.set(false);
    if (res.winnerId) {
      this.router.navigate(['/ordering']);
    }
  }

  getRestaurantName(id: string): string {
    return this.restaurants().find((r) => r.id === id)?.name ?? id;
  }
}
