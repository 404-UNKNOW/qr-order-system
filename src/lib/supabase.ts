import { createClient } from '@supabase/supabase-js';

// 环境变量应该在生产环境中配置，这里仅用于演示
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Menu = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  available: boolean;
  created_at?: string;
};

export type Order = {
  id: number;
  table_number: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  total_amount: number;
  created_at?: string;
  items: OrderItem[];
};

export type OrderItem = {
  id: number;
  order_id: number;
  menu_id: number;
  quantity: number;
  price: number;
  notes?: string;
  menu_item?: Menu;
};

export type Table = {
  id: number;
  table_number: string;
  qr_code?: string;
  status: 'available' | 'occupied';
}; 