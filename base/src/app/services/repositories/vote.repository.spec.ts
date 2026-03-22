import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { UserRepository } from './user.repository';
import { VoteRepository } from './vote.repository';

function makeRepos() {
  TestBed.configureTestingModule({});
  const userRepo = TestBed.inject(UserRepository);
  const voteRepo = TestBed.inject(VoteRepository);
  return { userRepo, voteRepo };
}

describe('VoteRepository', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  // ─── Property 7: Vote allocation validation ───────────────────────────────
  // Validates: Requirements 6.2
  it('Property 7: valid [3,2,1] allocation on 3 distinct restaurants is accepted', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 3, maxLength: 10 }).filter(
          (ids) => new Set(ids).size === ids.length
        ),
        fc.uuid(),
        (restaurantIds, userId) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { voteRepo } = makeRepos();
          voteRepo.startRound();

          const allocations = [
            { restaurantId: restaurantIds[0], points: 3 },
            { restaurantId: restaurantIds[1], points: 2 },
            { restaurantId: restaurantIds[2], points: 1 },
          ];
          const accepted = voteRepo.submitVote(userId, { userId, allocations });
          expect(accepted).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7: invalid allocation (wrong points) is rejected', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 3, maxLength: 3 }).filter(
          (ids) => new Set(ids).size === 3
        ),
        fc.uuid(),
        fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 3, maxLength: 3 }).filter(
          (pts) => {
            const sorted = [...pts].sort((a, b) => a - b);
            return !(sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3);
          }
        ),
        (restaurantIds, userId, badPoints) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { voteRepo } = makeRepos();
          voteRepo.startRound();

          const allocations = restaurantIds.map((id, i) => ({
            restaurantId: id,
            points: badPoints[i],
          }));
          const accepted = voteRepo.submitVote(userId, { userId, allocations });
          expect(accepted).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7: duplicate restaurant IDs in allocation are rejected', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (restaurantId, userId) => {
        localStorage.clear();
        TestBed.resetTestingModule();
        const { voteRepo } = makeRepos();
        voteRepo.startRound();

        const allocations = [
          { restaurantId, points: 3 },
          { restaurantId, points: 2 },
          { restaurantId: crypto.randomUUID(), points: 1 },
        ];
        const accepted = voteRepo.submitVote(userId, { userId, allocations });
        expect(accepted).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  // ─── Property 8: Veto recording round-trip ────────────────────────────────
  // Validates: Requirements 6.3
  it('Property 8: submitVeto then getCurrentRound includes that veto', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.uuid(), (userId, restaurantId) => {
        localStorage.clear();
        TestBed.resetTestingModule();
        const { voteRepo } = makeRepos();
        voteRepo.startRound();

        voteRepo.submitVeto(userId, restaurantId);
        const round = voteRepo.getCurrentRound();

        expect(round).not.toBeNull();
        const found = round!.vetoes.find(
          (v) => v.userId === userId && v.restaurantId === restaurantId
        );
        expect(found).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  // ─── Property 9: Voting algorithm correctness ─────────────────────────────
  // Validates: Requirements 6.4, 6.5
  it('Property 9: winner is highest-points restaurant with zero vetoes', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.uuid(), { minLength: 3, maxLength: 3 })
          .filter((ids) => new Set(ids).size === 3),
        fc.uuid(),
        ([r1, r2, r3], userId) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { voteRepo } = makeRepos();
          voteRepo.startRound();

          voteRepo.submitVote(userId, {
            userId,
            allocations: [
              { restaurantId: r1, points: 3 },
              { restaurantId: r2, points: 2 },
              { restaurantId: r3, points: 1 },
            ],
          });

          const result = voteRepo.endRound();
          expect(result.consensusReached).toBe(true);
          expect(result.winnerId).toBe(r1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: if sole top restaurant is vetoed → no consensus (spec: winner must have zero vetoes)', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.uuid(), { minLength: 3, maxLength: 3 })
          .filter((ids) => new Set(ids).size === 3),
        fc.uuid(),
        ([r1, r2, r3], voter) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { userRepo, voteRepo } = makeRepos();
          const vetoer = userRepo.add({ username: 'vetoer', isAdmin: false, isDisabled: false });

          voteRepo.startRound();

          voteRepo.submitVote(voter, {
            userId: voter,
            allocations: [
              { restaurantId: r1, points: 3 },
              { restaurantId: r2, points: 2 },
              { restaurantId: r3, points: 1 },
            ],
          });
          voteRepo.submitVeto(vetoer.id, r1);

          const result = voteRepo.endRound();
          expect(result.consensusReached).toBe(false);
          expect(result.winnerId).toBeNull();
          expect(result.vetoUsers).toContain('vetoer');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 9: if all top restaurants are vetoed → no consensus with vetoUsers', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.uuid(), { minLength: 3, maxLength: 3 })
          .filter((ids) => new Set(ids).size === 3),
        fc.uuid(),
        ([r1, r2, r3], voter) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { userRepo, voteRepo } = makeRepos();
          const u1 = userRepo.add({ username: 'alice', isAdmin: false, isDisabled: false });
          const u2 = userRepo.add({ username: 'bob', isAdmin: false, isDisabled: false });

          voteRepo.startRound();

          voteRepo.submitVote(voter, {
            userId: voter,
            allocations: [
              { restaurantId: r1, points: 3 },
              { restaurantId: r2, points: 2 },
              { restaurantId: r3, points: 1 },
            ],
          });
          voteRepo.submitVote(u1.id, {
            userId: u1.id,
            allocations: [
              { restaurantId: r2, points: 3 },
              { restaurantId: r1, points: 2 },
              { restaurantId: r3, points: 1 },
            ],
          });
          voteRepo.submitVeto(u1.id, r1);
          voteRepo.submitVeto(u2.id, r2);

          const result = voteRepo.endRound();
          expect(result.consensusReached).toBe(false);
          expect(result.winnerId).toBeNull();
          expect(result.vetoUsers.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  // ─── Property 10: Last choices retrieval ─────────────────────────────────
  // Validates: Requirements 6.6
  it('Property 10: getLastChoices(N) returns last min(N, total) winners', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        fc.integer({ min: 1, max: 5 }),
        (totalRounds, n) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { userRepo, voteRepo } = makeRepos();
          const voter = userRepo.add({ username: 'voter', isAdmin: false, isDisabled: false });

          const winners: string[] = [];
          for (let i = 0; i < totalRounds; i++) {
            const r1 = crypto.randomUUID();
            const r2 = crypto.randomUUID();
            const r3 = crypto.randomUUID();
            voteRepo.startRound();
            voteRepo.submitVote(voter.id, {
              userId: voter.id,
              allocations: [
                { restaurantId: r1, points: 3 },
                { restaurantId: r2, points: 2 },
                { restaurantId: r3, points: 1 },
              ],
            });
            const result = voteRepo.endRound();
            if (result.winnerId) winners.push(result.winnerId);
          }

          const choices = voteRepo.getLastChoices(n);
          const expected = Math.min(n, winners.length);
          expect(choices.length).toBe(expected);

          choices.forEach((id) => expect(winners).toContain(id));
          const lastN = winners.slice(-expected);
          expect(new Set(choices)).toEqual(new Set(lastN));
        }
      ),
      { numRuns: 100 }
    );
  });

  // ─── Property 11: Vote immutability during active round ───────────────────
  // Validates: Requirements 6.7
  it('Property 11: re-submitting a vote is rejected and original vote unchanged', () => {
    fc.assert(
      fc.property(
        fc
          .array(fc.uuid(), { minLength: 3, maxLength: 3 })
          .filter((ids) => new Set(ids).size === 3),
        fc
          .array(fc.uuid(), { minLength: 3, maxLength: 3 })
          .filter((ids) => new Set(ids).size === 3),
        fc.uuid(),
        ([r1, r2, r3], [s1, s2, s3], userId) => {
          localStorage.clear();
          TestBed.resetTestingModule();
          const { voteRepo } = makeRepos();
          voteRepo.startRound();

          const firstVote = {
            userId,
            allocations: [
              { restaurantId: r1, points: 3 },
              { restaurantId: r2, points: 2 },
              { restaurantId: r3, points: 1 },
            ],
          };
          const secondVote = {
            userId,
            allocations: [
              { restaurantId: s1, points: 3 },
              { restaurantId: s2, points: 2 },
              { restaurantId: s3, points: 1 },
            ],
          };

          const first = voteRepo.submitVote(userId, firstVote);
          const second = voteRepo.submitVote(userId, secondVote);

          expect(first).toBe(true);
          expect(second).toBe(false);

          const round = voteRepo.getCurrentRound();
          const userVotes = round!.votes.filter((v) => v.userId === userId);
          expect(userVotes.length).toBe(1);
          expect(userVotes[0].allocations).toEqual(firstVote.allocations);
        }
      ),
      { numRuns: 100 }
    );
  });
});
