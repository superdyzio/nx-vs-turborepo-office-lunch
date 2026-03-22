import type { User } from '../models/user.model';
import type { Restaurant } from '../models/restaurant.model';

const KEY_PREFIX = 'ol_';
const USERS_KEY = 'ol_users';
const RESTAURANTS_KEY = 'ol_restaurants';

const RESTAURANT_NAMES = [
  'Bella Italia',
  'Sushi Garden',
  'The Burger Joint',
  'Spice of India',
  'Le Petit Bistro',
  'Dragon Palace',
  'Green Bowl',
];

const DISH_TEMPLATES: Record<string, { name: string; price: number }[]> = {
  'Bella Italia': [
    { name: 'Margherita Pizza', price: 12 },
    { name: 'Spaghetti Carbonara', price: 14 },
    { name: 'Lasagna', price: 13 },
    { name: 'Tiramisu', price: 6 },
  ],
  'Sushi Garden': [
    { name: 'Salmon Nigiri (8 pcs)', price: 16 },
    { name: 'Tuna Roll', price: 14 },
    { name: 'Miso Soup', price: 4 },
    { name: 'Edamame', price: 5 },
  ],
  'The Burger Joint': [
    { name: 'Classic Cheeseburger', price: 11 },
    { name: 'BBQ Bacon Burger', price: 13 },
    { name: 'Veggie Burger', price: 10 },
    { name: 'Sweet Potato Fries', price: 5 },
  ],
  'Spice of India': [
    { name: 'Chicken Tikka Masala', price: 14 },
    { name: 'Lamb Biryani', price: 15 },
    { name: 'Garlic Naan', price: 3 },
    { name: 'Mango Lassi', price: 4 },
  ],
  'Le Petit Bistro': [
    { name: 'Croque Monsieur', price: 10 },
    { name: 'French Onion Soup', price: 8 },
    { name: 'Quiche Lorraine', price: 11 },
    { name: 'Crème Brûlée', price: 7 },
  ],
  'Dragon Palace': [
    { name: 'Kung Pao Chicken', price: 13 },
    { name: 'Dim Sum Basket', price: 12 },
    { name: 'Fried Rice', price: 9 },
    { name: 'Spring Rolls (4 pcs)', price: 6 },
  ],
  'Green Bowl': [
    { name: 'Buddha Bowl', price: 12 },
    { name: 'Avocado Toast', price: 9 },
    { name: 'Quinoa Salad', price: 11 },
    { name: 'Smoothie Bowl', price: 8 },
  ],
};

function clearOfficeLunchData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEY_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function seedUsers(): void {
  const users: User[] = [];

  // 1 admin user
  users.push({
    id: crypto.randomUUID(),
    username: 'admin',
    password: 'admin',
    isAdmin: true,
    isDisabled: false,
  });

  // 5 regular users
  for (let i = 1; i <= 5; i++) {
    users.push({
      id: crypto.randomUUID(),
      username: `user${i}`,
      password: 'lunch',
      isAdmin: false,
      isDisabled: false,
    });
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedRestaurants(): void {
  const restaurants: Restaurant[] = RESTAURANT_NAMES.map((name) => ({
    id: crypto.randomUUID(),
    name,
    isDisabled: false,
    dishes: (DISH_TEMPLATES[name] ?? []).map((dish) => ({
      id: crypto.randomUUID(),
      name: dish.name,
      price: dish.price,
    })),
  }));

  localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));
}

export function initDb(): void {
  clearOfficeLunchData();
  seedUsers();
  seedRestaurants();
  console.log(
    '[initDb] Database initialized: 6 users (1 admin + 5 regular), 7 restaurants with 4 dishes each.'
  );
}
