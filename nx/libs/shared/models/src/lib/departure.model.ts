export interface DepartureResponse {
  userId: string;
  canLeave: boolean;
  alternativeTime?: string; // HH:mm format
}
