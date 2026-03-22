export interface Dish {
  id: string;
  name: string;
  price?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  dishes: Dish[];
  isDisabled: boolean;
}
