import { supabase, InventoryItemUI } from './supabase';
import { getLocationForCategory, estimateExpiryDate } from './anthropic';

/**
 * Get all inventory items for the current user
 * Works with simple schema (user_id, name, location, expiry_date)
 */
export async function getInventoryItems(authUserId: string): Promise<InventoryItemUI[]> {
  try {
    // Get items directly by auth user_id - simple and reliable
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', authUserId)
      .order('expiry_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }

    // Map database items to UI items (handle both old and new schema)
    return (data || []).map((item): InventoryItemUI => ({
      id: item.id || item.item_id,
      name: item.name || item.custom_name || 'Unnamed Item',
      quantity: Number(item.quantity) || 1,
      category: item.category || 'other',
      location: (item.location || item.storage_location || 'pantry') as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: item.purchase_date,
      expiry_date: item.expiry_date || item.expected_expiry_date || null,
      price: item.price ? Number(item.price) : undefined,
      image_url: item.image_url || item.source_image_url,
      daysUntilExpiry: calculateDaysUntilExpiry(item.expiry_date || item.expected_expiry_date),
    }));
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

/**
 * Add a single item to inventory
 */
export async function addInventoryItem(
  authUserId: string,
  item: {
    name: string;
    quantity: number;
    category: string;
    location?: 'fridge' | 'freezer' | 'pantry' | 'counter';
    purchase_date?: string;
    expiry_date?: string;
    price?: number;
    image_url?: string;
  }
): Promise<InventoryItemUI> {
  try {
    // Auto-assign location if not provided
    const location = item.location || getLocationForCategory(item.category);

    // Estimate expiry date if not provided
    let expiryDate = item.expiry_date;
    if (!expiryDate) {
      const estimated = estimateExpiryDate(item.category);
      expiryDate = estimated.toISOString().split('T')[0];
    }

    // Try with 'name' column first, fallback to 'custom_name' for legacy schema
    let data, error;
    
    // First attempt with simple column names
    const simpleInsert = await supabase
      .from('inventory_items')
      .insert({
        user_id: authUserId,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        location: location,
        purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
        expiry_date: expiryDate,
        price: item.price,
        image_url: item.image_url,
      })
      .select()
      .single();
    
    if (simpleInsert.error && simpleInsert.error.message.includes("'name'")) {
      // Fallback to legacy schema with custom_name
      const legacyInsert = await supabase
        .from('inventory_items')
        .insert({
          user_id: authUserId,
          custom_name: item.name,
          quantity: item.quantity,
          category: item.category,
          storage_location: location,
          location: location,
          purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
          expected_expiry_date: expiryDate,
          expiry_date: expiryDate,
          price: item.price,
          image_url: item.image_url,
          input_method: 'manual',
          state: 'stocked',
        })
        .select()
        .single();
      
      data = legacyInsert.data;
      error = legacyInsert.error;
    } else {
      data = simpleInsert.data;
      error = simpleInsert.error;
    }

    if (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }

    return {
      id: data.id || data.item_id,
      name: data.name || data.custom_name || 'Unnamed Item',
      quantity: Number(data.quantity),
      category: data.category,
      location: (data.location || data.storage_location || 'pantry') as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: data.purchase_date,
      expiry_date: data.expiry_date || data.expected_expiry_date,
      price: data.price ? Number(data.price) : undefined,
      image_url: data.image_url,
      daysUntilExpiry: calculateDaysUntilExpiry(data.expiry_date || data.expected_expiry_date),
    };
  } catch (error: any) {
    console.error('Error in addInventoryItem:', error);
    throw error;
  }
}

/**
 * Add multiple items to inventory (from receipt scan)
 */
export async function addMultipleInventoryItems(
  authUserId: string,
  items: Array<{
    name: string;
    quantity: number;
    category: string;
    price?: number;
    location?: 'fridge' | 'freezer' | 'pantry' | 'counter';
    expiry_date?: string;
  }>
): Promise<InventoryItemUI[]> {
  try {
    const itemsToInsert = items.map((item) => {
      const location = item.location || getLocationForCategory(item.category);
      let expiryDate = item.expiry_date;
      if (!expiryDate) {
        const estimated = estimateExpiryDate(item.category);
        expiryDate = estimated.toISOString().split('T')[0];
      }

      return {
        user_id: authUserId,
        custom_name: item.name, // Use custom_name for compatibility
        name: item.name, // Also try name
        quantity: item.quantity,
        category: item.category,
        storage_location: location,
        location: location,
        purchase_date: new Date().toISOString().split('T')[0],
        expected_expiry_date: expiryDate,
        expiry_date: expiryDate,
        price: item.price,
        input_method: 'receipt_scan',
        state: 'stocked',
      };
    });

    // Try insert - Supabase will ignore columns that don't exist
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(itemsToInsert)
      .select();

    if (error) {
      console.error('Error adding multiple inventory items:', error);
      throw error;
    }

    return (data || []).map((item): InventoryItemUI => ({
      id: item.id,
      name: item.name,
      quantity: Number(item.quantity),
      category: item.category,
      location: item.location as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: item.purchase_date,
      expiry_date: item.expiry_date,
      price: item.price ? Number(item.price) : undefined,
      daysUntilExpiry: calculateDaysUntilExpiry(item.expiry_date),
    }));
  } catch (error: any) {
    console.error('Error in addMultipleInventoryItems:', error);
    throw error;
  }
}

/**
 * Update an inventory item
 */
export async function updateInventoryItem(
  itemId: string,
  updates: Partial<{
    name: string;
    quantity: number;
    category: string;
    location: 'fridge' | 'freezer' | 'pantry' | 'counter';
    expiry_date: string;
    price: number;
  }>
): Promise<InventoryItemUI> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      quantity: Number(data.quantity),
      category: data.category,
      location: data.location as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: data.purchase_date,
      expiry_date: data.expiry_date,
      price: data.price ? Number(data.price) : undefined,
      daysUntilExpiry: calculateDaysUntilExpiry(data.expiry_date),
    };
  } catch (error: any) {
    console.error('Error in updateInventoryItem:', error);
    throw error;
  }
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(itemId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error in deleteInventoryItem:', error);
    throw error;
  }
}

/**
 * Calculate days until expiry
 */
export function calculateDaysUntilExpiry(expiryDate: string | null | undefined): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
