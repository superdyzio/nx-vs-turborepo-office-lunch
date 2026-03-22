import { Injectable } from '@angular/core';
import {
  VetoEntry,
  VoteEntry,
  VotingResult,
  VotingRound,
} from '../../models/voting.model';
import { LocalStorageService } from '../local-storage.service';
import { UserRepository } from './user.repository';

const KEY = 'ol_votes';

@Injectable({ providedIn: 'root' })
export class VoteRepository {
  constructor(
    private storage: LocalStorageService,
    private userRepo: UserRepository
  ) {}

  private load(): VotingRound[] {
    return this.storage.getItem<VotingRound[]>(KEY) ?? [];
  }

  private save(rounds: VotingRound[]): void {
    this.storage.setItem(KEY, rounds);
  }

  getCurrentRound(): VotingRound | null {
    return this.load().find((r) => r.isActive) ?? null;
  }

  startRound(): VotingRound {
    const rounds = this.load();
    // Close any existing active round
    const updated = rounds.map((r) =>
      r.isActive ? { ...r, isActive: false } : r
    );
    const newRound: VotingRound = {
      id: crypto.randomUUID(),
      isActive: true,
      votes: [],
      vetoes: [],
      winnerId: null,
      createdAt: new Date().toISOString(),
    };
    updated.push(newRound);
    this.save(updated);
    return newRound;
  }

  /**
   * Validates and records a vote.
   * A valid vote has exactly 3 allocations with point values [3, 2, 1] on distinct restaurant IDs.
   * Returns true if accepted, false if rejected.
   */
  submitVote(userId: string, vote: VoteEntry): boolean {
    const round = this.getCurrentRound();
    if (!round) return false;

    // Reject duplicate vote
    if (round.votes.some((v) => v.userId === userId)) return false;

    // Validate allocation: exactly 3 entries, distinct restaurants, points are permutation of [3,2,1]
    if (vote.allocations.length !== 3) return false;
    const points = vote.allocations.map((a) => a.points).sort((a, b) => a - b);
    if (points[0] !== 1 || points[1] !== 2 || points[2] !== 3) return false;
    const ids = vote.allocations.map((a) => a.restaurantId);
    if (new Set(ids).size !== 3) return false;

    const rounds = this.load();
    const idx = rounds.findIndex((r) => r.id === round.id);
    if (idx === -1) return false;
    rounds[idx].votes.push({ userId, allocations: vote.allocations });
    this.save(rounds);
    return true;
  }

  submitVeto(userId: string, restaurantId: string): void {
    const round = this.getCurrentRound();
    if (!round) return;

    const rounds = this.load();
    const idx = rounds.findIndex((r) => r.id === round.id);
    if (idx === -1) return;

    // Replace existing veto from same user if any
    rounds[idx].vetoes = rounds[idx].vetoes.filter((v) => v.userId !== userId);
    rounds[idx].vetoes.push({ userId, restaurantId });
    this.save(rounds);
  }

  endRound(): VotingResult {
    const round = this.getCurrentRound();
    if (!round) {
      return { winnerId: null, consensusReached: false, vetoUsers: [] };
    }

    // Tally points per restaurant
    const scores = new Map<string, number>();
    for (const vote of round.votes) {
      for (const alloc of vote.allocations) {
        scores.set(
          alloc.restaurantId,
          (scores.get(alloc.restaurantId) ?? 0) + alloc.points
        );
      }
    }

    if (scores.size === 0) {
      this.closeRound(round.id, null);
      return { winnerId: null, consensusReached: false, vetoUsers: [] };
    }

    const maxScore = Math.max(...scores.values());
    const topRestaurants = [...scores.entries()]
      .filter(([, pts]) => pts === maxScore)
      .map(([id]) => id);

    // Build veto set: restaurantId → set of userIds who vetoed it
    const vetoMap = new Map<string, string[]>();
    for (const veto of round.vetoes) {
      const list = vetoMap.get(veto.restaurantId) ?? [];
      list.push(veto.userId);
      vetoMap.set(veto.restaurantId, list);
    }

    // Find top restaurants with zero vetoes
    const unvetoed = topRestaurants.filter(
      (id) => !vetoMap.has(id) || vetoMap.get(id)!.length === 0
    );

    if (unvetoed.length > 0) {
      const winnerId = unvetoed[0];
      this.closeRound(round.id, winnerId);
      return { winnerId, consensusReached: true, vetoUsers: [] };
    }

    // All top restaurants are vetoed — collect blocking veto usernames
    const blockingUserIds = new Set<string>();
    for (const id of topRestaurants) {
      (vetoMap.get(id) ?? []).forEach((uid) => blockingUserIds.add(uid));
    }

    const vetoUsers = [...blockingUserIds]
      .map((uid) => this.userRepo.getById(uid)?.username ?? uid)
      .filter(Boolean);

    this.closeRound(round.id, null);
    return { winnerId: null, consensusReached: false, vetoUsers };
  }

  private closeRound(roundId: string, winnerId: string | null): void {
    const rounds = this.load();
    const idx = rounds.findIndex((r) => r.id === roundId);
    if (idx !== -1) {
      rounds[idx].isActive = false;
      rounds[idx].winnerId = winnerId;
      this.save(rounds);
    }
  }

  /** Returns last N winning restaurant IDs in reverse chronological order */
  getLastChoices(count: number): string[] {
    const all = this.load();
    return all
      .map((r, index) => ({ ...r, index }))
      .filter((r) => !r.isActive && r.winnerId !== null)
      .sort((a, b) => {
        const timeDiff =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Use insertion index as tiebreaker for same-millisecond rounds
        return timeDiff !== 0 ? timeDiff : b.index - a.index;
      })
      .slice(0, count)
      .map((r) => r.winnerId as string);
  }
}
