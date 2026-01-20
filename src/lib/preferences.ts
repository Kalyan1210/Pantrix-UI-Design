import { supabase } from './supabase';

export interface UserPreferences {
  user_id: string;
  enable_push_notifications: boolean;
  enable_email_notifications: boolean;
  spoilage_alert_advance_days: number;
  theme: 'system' | 'light' | 'dark';
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
      return null;
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
): Promise<UserPreferences | null> {
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

      if (error) {
        console.error('Error updating preferences:', error);
        return null;
      }
      data = updated;
    } else {
      // Create new preferences with defaults
      const defaultPrefs = {
        user_id: userId,
        enable_push_notifications: true,
        enable_email_notifications: false,
        spoilage_alert_advance_days: 3,
        theme: 'system' as const,
        ...preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: created, error } = await supabase
        .from('user_preferences')
        .insert(defaultPrefs)
        .select()
        .single();

      if (error) {
        console.error('Error creating preferences:', error);
        return null;
      }
      data = created;
    }

    return data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
}

/**
 * Upload profile photo to Supabase Storage
 * Returns the public URL of the uploaded photo
 */
export async function updateProfilePhoto(userId: string, file: File): Promise<string> {
  try {
    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    // Update user metadata via auth (this is the proper way without a public users table)
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    if (updateError) {
      console.warn('Could not update user metadata:', updateError);
      // Still return the URL even if metadata update fails
    }

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

/**
 * Update user profile (display name)
 * Uses auth.updateUser to update user metadata
 */
export async function updateUserProfile(
  updates: { display_name?: string }
): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { 
        name: updates.display_name,
        display_name: updates.display_name 
      }
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
