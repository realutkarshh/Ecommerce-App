// types/index.ts
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Burger' | 'Pizza' | 'Fries' | 'Drink' | 'Dessert';
  bestSeller?: boolean;
  createdAt?: string;
  imagePublicId?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  token: string;
}
