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
  name_es?: string | null;
  description_es?: string | null;
}

export interface Service {
  id: string;
  title: string;
  category_id: string;
  price: number;
  image: string;
  description: string[];
  service_points?: string[];
  created_at: Date;
  updated_at: Date;
  title_es?: string | null;
  description_es?: string[] | null;
  service_points_es?: string[] | null;
}

export interface ServicePrice {
  id: string;
  service_id: string;
  type: 'bar' | 'box' | 'custom' | 'selectors' | 'additional';
  config: Record<string, any>;
  config_es?: Record<string, any> | null;
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
