import { supabase, InventoryItem, InventoryItemUI, mapInventoryItemToUI } from './supabase';
import { getLocationForCategory, estimateExpiryDate } from './anthropic';
import { getCurrentUser } from './auth';

// Helper to get or create a default household for a user
async function getOrCreateUserHousehold(authUserId: string, publicUserId?: string): Promise<string> {
  try {
    // Use publicUserId if available, otherwise try to find it
    let userId = publicUserId;
    if (!userId) {
      // Get user_id from public.users table
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const { data: publicUser } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', authUser.email)
          .single();
        userId = publicUser?.user_id;
      }
    }

    if (!userId) {
      throw new Error('Could not find user_id in public.users table');
    }

    // First, try to get user's default household from user_preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('default_household_id')
      .eq('user_id', userId)
      .single();

    if (prefs?.default_household_id) {
      return prefs.default_household_id;
    }

    // Check if user is a member of any household
    const { data: member } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (member?.household_id) {
      return member.household_id;
    }

    // Get user's display name from users table
    const { data: userData } = await supabase
      .from('users')
      .select('display_name')
      .eq('user_id', userId)
      .single();

    const displayName = userData?.display_name || 'My Household';

    // Create a new household for the user
    const { data: household, error: householdError } = await supabase
      .from('households')
      .insert({
        household_name: `${displayName}'s Household`,
        created_by: userId,
      })
      .select()
      .single();

    if (householdError) {
      console.error('Error creating household:', householdError);
      throw householdError;
    }

    // Add user as admin member
    await supabase
      .from('household_members')
      .insert({
        household_id: household.household_id,
        user_id: userId,
        role: 'admin',
      });

    return household.household_id;
  } catch (error) {
    console.error('Error getting/creating household:', error);
    throw error;
  }
}

export async function getInventoryItems(authUserId: string, publicUserId?: string): Promise<InventoryItemUI[]> {
  try {
    // Get user's household
    const householdId = await getOrCreateUserHousehold(authUserId, publicUserId);

    // Query using household_id (your schema uses household_id, not user_id)
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('household_id', householdId)
      .eq('state', 'stocked') // Only get active items
      .order('expected_expiry_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }

    // Map database items to UI items
    return (data || []).map(mapInventoryItemToUI);
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
}

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
  },
  publicUserId?: string
): Promise<InventoryItemUI> {
  try {
    // Get or create household
    const householdId = await getOrCreateUserHousehold(authUserId, publicUserId);
    
    // Get public user_id if not provided
    let userId = publicUserId;
    if (!userId) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const { data: publicUser } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', authUser.email)
          .single();
        userId = publicUser?.user_id;
      }
    }

    // Auto-assign location if not provided
    const location = item.location || getLocationForCategory(item.category);

    // Estimate expiry date if not provided
    let expiryDate = item.expiry_date;
    if (!expiryDate) {
      const estimated = estimateExpiryDate(item.category);
      expiryDate = estimated.toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        household_id: householdId,
        custom_name: item.name, // Your schema uses custom_name
        quantity: item.quantity,
        category: item.category,
        storage_location: location, // Your schema uses storage_location
        purchase_date: item.purchase_date || new Date().toISOString().split('T')[0],
        expected_expiry_date: expiryDate, // Your schema uses expected_expiry_date
        price: item.price,
        image_url: item.image_url,
        added_by: userId || null,
        input_method: 'manual',
        state: 'stocked',
        user_id: authUserId, // Set auth user id if column exists
        location: location, // Also set location if the column exists
        expiry_date: expiryDate, // Also set expiry_date if the column exists
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }

    return mapInventoryItemToUI(data);
  } catch (error: any) {
    console.error('Error in addInventoryItem:', error);
    throw error;
  }
}

export async function addMultipleInventoryItems(
  authUserId: string,
  items: Array<{
    name: string;
    quantity: number;
    category: string;
    price?: number;
    location?: 'fridge' | 'freezer' | 'pantry' | 'counter';
    expiry_date?: string;
  }>,
  publicUserId?: string
): Promise<InventoryItemUI[]> {
  try {
    // Get or create household
    const householdId = await getOrCreateUserHousehold(authUserId, publicUserId);
    
    // Get public user_id if not provided
    let userId = publicUserId;
    if (!userId) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const { data: publicUser } = await supabase
          .from('users')
          .select('user_id')
          .eq('email', authUser.email)
          .single();
        userId = publicUser?.user_id;
      }
    }

    const itemsToInsert = items.map((item) => {
      const location = item.location || getLocationForCategory(item.category);
      let expiryDate = item.expiry_date;
      if (!expiryDate) {
        const estimated = estimateExpiryDate(item.category);
        expiryDate = estimated.toISOString().split('T')[0];
      }

      return {
        household_id: householdId,
        custom_name: item.name,
        quantity: item.quantity,
        category: item.category,
        storage_location: location,
        purchase_date: new Date().toISOString().split('T')[0],
        expected_expiry_date: expiryDate,
        price: item.price,
        added_by: userId || null,
        input_method: 'receipt_scan',
        state: 'stocked',
        user_id: authUserId,
        location: location,
        expiry_date: expiryDate,
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

    return (data || []).map(mapInventoryItemToUI);
  } catch (error: any) {
    console.error('Error in addMultipleInventoryItems:', error);
    throw error;
  }
}

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
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Map UI fields to database fields
    if (updates.name !== undefined) {
      updateData.custom_name = updates.name;
    }
    if (updates.quantity !== undefined) {
      updateData.quantity = updates.quantity;
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category;
    }
    if (updates.location !== undefined) {
      updateData.storage_location = updates.location;
      updateData.location = updates.location; // Also update location if column exists
    }
    if (updates.expiry_date !== undefined) {
      updateData.expected_expiry_date = updates.expiry_date;
      updateData.expiry_date = updates.expiry_date; // Also update expiry_date if column exists
    }
    if (updates.price !== undefined) {
      updateData.price = updates.price;
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('item_id', itemId) // Your schema uses item_id
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }

    return mapInventoryItemToUI(data);
  } catch (error: any) {
    console.error('Error in updateInventoryItem:', error);
    throw error;
  }
}

export async function deleteInventoryItem(itemId: string): Promise<void> {
  try {
    // Your schema might use soft delete (state = 'used') or hard delete
    // Let's try soft delete first by updating state
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ 
        state: 'used',
        used_up_at: new Date().toISOString()
      })
      .eq('item_id', itemId);

    if (updateError) {
      // If soft delete fails, try hard delete
      const { error: deleteError } = await supabase
        .from('inventory_items')
        .delete()
        .eq('item_id', itemId);

      if (deleteError) {
        console.error('Error deleting inventory item:', deleteError);
        throw deleteError;
      }
    }
  } catch (error: any) {
    console.error('Error in deleteInventoryItem:', error);
    throw error;
  }
}

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
