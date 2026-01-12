export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: Date;
}

export interface Game {
  id: string;
  title: string;
  category: string;
  image: string;
  created_at: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: Date;
}

export interface Service {
  id: string;
  title: string;
  category_id: string;
  price: number;
  image: string;
  description: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ServicePrice {
  id: string;
  service_id: string;
  type: 'bar' | 'box' | 'custom' | 'selectors' | 'additional';
  config: Record<string, any>;
}

export interface ServiceGame {
  service_id: string;
  game_id: string;
}

export interface ImageAsset {
  id: string;
  url: string;
  filename: string;
  created_at: Date;
}
