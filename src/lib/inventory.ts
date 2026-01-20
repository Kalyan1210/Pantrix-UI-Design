import { supabase, InventoryItemUI } from './supabase';
import { getLocationForCategory, estimateExpiryDate } from './anthropic';

/**
 * Get all inventory items for the current user
 * Uses legacy column names (custom_name, storage_location, expected_expiry_date, item_id)
 */
export async function getInventoryItems(authUserId: string): Promise<InventoryItemUI[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', authUserId)
      .order('expected_expiry_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }

    // Map database items to UI items - handle legacy column names
    return (data || []).map((item): InventoryItemUI => ({
      id: item.item_id || item.id,
      name: item.custom_name || item.name || 'Unnamed Item',
      quantity: Number(item.quantity) || 1,
      category: item.category || 'other',
      location: (item.storage_location || item.location || 'pantry') as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: item.purchase_date,
      expiry_date: item.expected_expiry_date || item.expiry_date || null,
      price: item.price ? Number(item.price) : undefined,
      image_url: item.image_url || item.source_image_url,
      daysUntilExpiry: calculateDaysUntilExpiry(item.expected_expiry_date || item.expiry_date),
    }));
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

/**
 * Add a single item to inventory
 * Uses ONLY legacy column names that exist in the database
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
    const storageLocation = item.location || getLocationForCategory(item.category);

    let expiryDate = item.expiry_date;
    if (!expiryDate) {
      const estimated = estimateExpiryDate(item.category);
      expiryDate = estimated.toISOString().split('T')[0];
    }

    // Use ONLY legacy column names that exist in the database
    const insertData = {
      user_id: authUserId,
      household_id: authUserId,
      custom_name: item.name,
      quantity: item.quantity,
      category: item.category,
      storage_location: storageLocation,
      purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
      expected_expiry_date: expiryDate,
      price: item.price || null,
      image_url: item.image_url || null,
      input_method: 'manual',
      state: 'stocked',
      added_by: authUserId,
    };

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }

    return {
      id: data.item_id || data.id,
      name: data.custom_name || data.name || 'Unnamed Item',
      quantity: Number(data.quantity),
      category: data.category,
      location: (data.storage_location || data.location || 'pantry') as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: data.purchase_date,
      expiry_date: data.expected_expiry_date || data.expiry_date,
      price: data.price ? Number(data.price) : undefined,
      image_url: data.image_url,
      daysUntilExpiry: calculateDaysUntilExpiry(data.expected_expiry_date || data.expiry_date),
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
      const storageLocation = item.location || getLocationForCategory(item.category);
      let expiryDate = item.expiry_date;
      if (!expiryDate) {
        const estimated = estimateExpiryDate(item.category);
        expiryDate = estimated.toISOString().split('T')[0];
      }

      // Use ONLY legacy column names
      return {
        user_id: authUserId,
        household_id: authUserId,
        custom_name: item.name,
        quantity: item.quantity,
        category: item.category,
        storage_location: storageLocation,
        purchase_date: new Date().toISOString().split('T')[0],
        expected_expiry_date: expiryDate,
        price: item.price || null,
        input_method: 'receipt_scan',
        state: 'stocked',
        added_by: authUserId,
      };
    });

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(itemsToInsert)
      .select();

    if (error) {
      console.error('Error adding multiple inventory items:', error);
      throw error;
    }

    return (data || []).map((item): InventoryItemUI => ({
      id: item.item_id || item.id,
      name: item.custom_name || item.name || 'Unnamed Item',
      quantity: Number(item.quantity),
      category: item.category,
      location: (item.storage_location || 'pantry') as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: item.purchase_date,
      expiry_date: item.expected_expiry_date || item.expiry_date,
      price: item.price ? Number(item.price) : undefined,
      daysUntilExpiry: calculateDaysUntilExpiry(item.expected_expiry_date),
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
    // Map to legacy column names
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (updates.name !== undefined) updateData.custom_name = updates.name;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.location !== undefined) updateData.storage_location = updates.location;
    if (updates.expiry_date !== undefined) updateData.expected_expiry_date = updates.expiry_date;
    if (updates.price !== undefined) updateData.price = updates.price;

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('item_id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }

    return {
      id: data.item_id || data.id,
      name: data.custom_name || data.name || 'Unnamed Item',
      quantity: Number(data.quantity),
      category: data.category,
      location: (data.storage_location || 'pantry') as 'fridge' | 'freezer' | 'pantry' | 'counter',
      purchase_date: data.purchase_date,
      expiry_date: data.expected_expiry_date || data.expiry_date,
      price: data.price ? Number(data.price) : undefined,
      daysUntilExpiry: calculateDaysUntilExpiry(data.expected_expiry_date),
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
    // Try with item_id first (legacy), then id
    let { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('item_id', itemId);

    if (error) {
      // Fallback to 'id' column
      const result = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);
      
      if (result.error) {
        console.error('Error deleting inventory item:', result.error);
        throw result.error;
      }
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
