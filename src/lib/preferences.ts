import { supabase } from './supabase';

export interface UserPreferences {
  user_id: string;
  enable_push_notifications: boolean;
  enable_email_notifications: boolean;
  spoilage_alert_advance_days: number;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  default_store?: string;
  dietary_restrictions?: string[];
  preferred_cuisines?: string[];
  disliked_cuisines?: string[];
  preferred_cook_time?: string;
  skill_level?: string;
  recipe_notifications: boolean;
  notification_time?: string;
  weekend_brunch_suggestions: boolean;
  theme: 'system' | 'light' | 'dark';
  default_household_id?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is okay
      console.error('Error fetching preferences:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return null;
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  try {
    // Check if preferences exist
    const existing = await getUserPreferences(userId);

    let data;
    if (existing) {
      // Update existing preferences
      const { data: updated, error } = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      data = updated;
    } else {
      // Create new preferences
      const { data: created, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          ...preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      data = created;
    }

    return data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}

export async function updateProfilePhoto(userId: string, file: File): Promise<string> {
  try {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photo_url: publicUrl })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: { display_name?: string; profile_photo_url?: string }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

