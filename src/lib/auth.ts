import { supabase } from './supabase';

export async function signUp(email: string, password: string, name?: string) {
  const displayName = name || email.split('@')[0];
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: displayName,
      },
    },
  });

  if (error) throw error;
  
  // Create user record in public.users table if auth signup succeeded
  if (data.user) {
    try {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          email: email,
          display_name: displayName,
          auth_provider: 'email',
          email_verified: false,
        });
      
      if (userError) {
        console.warn('Could not create user in public.users table:', userError);
        // Don't throw - auth signup succeeded, user record creation can be handled by a trigger
      }
    } catch (err) {
      console.warn('Error creating user record:', err);
      // Don't throw - auth signup succeeded
    }
  }
  
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get the user_id from public.users table that matches auth.users
  // Your schema uses public.users with user_id, not auth.users directly
  const { data: publicUser } = await supabase
    .from('users')
    .select('user_id, email, display_name')
    .eq('email', user.email)
    .single();
  
  if (publicUser) {
    // Return a combined user object with both auth and public user data
    return {
      ...user,
      user_id: publicUser.user_id,
      display_name: publicUser.display_name,
    };
  }
  
  return user;
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

