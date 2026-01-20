import { supabase } from './supabase';

// OAuth sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
    },
  });

  if (error) throw error;
  return data;
}

// OAuth sign in with Microsoft (Azure)
export async function signInWithMicrosoft() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}`,
      scopes: 'email profile openid',
    },
  });

  if (error) throw error;
  return data;
}

// OAuth sign in with Apple
export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, name?: string) {
  const displayName = name || email.split('@')[0];
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: displayName,
        display_name: displayName,
      },
    },
  });

  if (error) throw error;
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
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  
  if (!user) return null;
  
  // Return user with display name from user_metadata
  // This works for both email/password and OAuth users
  return {
    ...user,
    display_name: user.user_metadata?.name || 
                  user.user_metadata?.display_name || 
                  user.user_metadata?.full_name ||
                  user.email?.split('@')[0] || 
                  'User',
  };
}

export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
