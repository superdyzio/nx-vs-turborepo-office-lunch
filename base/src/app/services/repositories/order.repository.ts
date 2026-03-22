import { Injectable } from '@angular/core';
import { Order } from '../../models/order.model';
import { LocalStorageService } from '../local-storage.service';

const KEY = 'ol_orders';

@Injectable({ providedIn: 'root' })
export class OrderRepository {
  constructor(private storage: LocalStorageService) {}

  private load(): Order[] {
    return this.storage.getItem<Order[]>(KEY) ?? [];
  }

  private save(orders: Order[]): void {
    this.storage.setItem(KEY, orders);
  }

  getAll(): Order[] {
    return this.load();
  }

  getByRound(roundId: string): Order[] {
    return this.load().filter((o) => o.roundId === roundId);
  }

  submitOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const orders = this.load();
    orders.push(newOrder);
    this.save(orders);
    return newOrder;
  }
}
