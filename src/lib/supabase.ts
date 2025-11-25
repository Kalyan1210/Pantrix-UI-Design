import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types - Updated to match your actual schema
export interface InventoryItem {
  item_id: string; // Your schema uses item_id, not id
  household_id: string;
  product_id?: string | null;
  custom_name?: string | null; // Your schema uses custom_name, not name
  quantity: number;
  unit?: string | null;
  storage_location: 'fridge' | 'freezer' | 'pantry' | 'counter'; // Your schema uses storage_location
  purchase_date: string;
  expected_expiry_date?: string | null; // Your schema uses expected_expiry_date, not expiry_date
  state?: string;
  spoilage_urgency_score?: number;
  added_by?: string | null;
  input_method?: string;
  source_image_url?: string | null;
  created_at: string;
  updated_at: string;
  used_up_at?: string | null;
  category: string;
  user_id?: string | null; // This column exists but may be nullable
  location?: string | null; // This also exists
  expiry_date?: string | null; // This also exists
  price?: number | null;
  image_url?: string | null;
}

// Helper to map your schema to a simpler interface for the UI
export interface InventoryItemUI {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: 'fridge' | 'freezer' | 'pantry' | 'counter';
  purchase_date?: string;
  expiry_date?: string | null;
  price?: number;
  image_url?: string;
  daysUntilExpiry?: number | null;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface ParsedReceipt {
  items: ReceiptItem[];
  total?: number;
  store?: string;
  date?: string;
}

// Helper function to convert database item to UI item
export function mapInventoryItemToUI(item: InventoryItem): InventoryItemUI {
  // Use custom_name if available, otherwise fallback to a default
  const name = item.custom_name || 'Unnamed Item';
  
  // Use storage_location as primary, fallback to location if storage_location is not set
  const location = (item.storage_location || item.location || 'pantry') as 'fridge' | 'freezer' | 'pantry' | 'counter';
  
  // Use expected_expiry_date as primary, fallback to expiry_date
  const expiryDate = item.expected_expiry_date || item.expiry_date || null;
  
  // Calculate days until expiry
  let daysUntilExpiry: number | null = null;
  if (expiryDate) {
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    id: item.item_id,
    name,
    quantity: Number(item.quantity),
    category: item.category || 'other',
    location,
    purchase_date: item.purchase_date,
    expiry_date: expiryDate,
    price: item.price ? Number(item.price) : undefined,
    image_url: item.image_url || item.source_image_url || undefined,
    daysUntilExpiry,
  };
}
