export interface VoteEntry {
  userId: string;
  allocations: { restaurantId: string; points: number }[]; // exactly 3 entries: 3, 2, 1
}

export interface VetoEntry {
  userId: string;
  restaurantId: string;
}

export interface VotingRound {
  id: string;
  isActive: boolean;
  votes: VoteEntry[];
  vetoes: VetoEntry[];
  winnerId: string | null;
  createdAt: string; // ISO date
}

export interface VotingResult {
  winnerId: string | null;
  consensusReached: boolean;
  vetoUsers: string[]; // usernames who blocked consensus
}
