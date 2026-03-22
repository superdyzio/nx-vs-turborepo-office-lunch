import { Injectable } from '@angular/core';
import type { DepartureResponse } from '../../models/departure.model';
import type { LocalStorageService } from '../local-storage.service';

const KEY = 'ol_sessions';

@Injectable({ providedIn: 'root' })
export class SessionRepository {
  constructor(private storage: LocalStorageService) {}

  private load(): DepartureResponse[] {
    return this.storage.getItem<DepartureResponse[]>(KEY) ?? [];
  }

  private save(responses: DepartureResponse[]): void {
    this.storage.setItem(KEY, responses);
  }

  getDepartureResponse(userId: string): DepartureResponse | null {
    return this.load().find((r) => r.userId === userId) ?? null;
  }

  setDepartureResponse(userId: string, response: DepartureResponse): void {
    const responses = this.load().filter((r) => r.userId !== userId);
    responses.push({ ...response, userId });
    this.save(responses);
  }

  getAllResponses(): DepartureResponse[] {
    return this.load();
  }
}
