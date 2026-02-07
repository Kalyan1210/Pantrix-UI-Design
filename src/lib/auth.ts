import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// Get the appropriate redirect URL based on platform
function getRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) {
    // Use custom URL scheme for native apps
    return 'pantrix://auth/callback';
  }
  // Use origin for web
  return `${window.location.origin}`;
}

// OAuth sign in with Google
export async function signInWithGoogle() {
  const redirectTo = getRedirectUrl();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Capacitor.isNativePlatform(),
    },
  });

  if (error) throw error;
  
  // On native, open the OAuth URL in the system browser
  if (Capacitor.isNativePlatform() && data.url) {
    await Browser.open({ url: data.url });
  }
  
  return data;
}

// OAuth sign in with Microsoft (Azure)
export async function signInWithMicrosoft() {
  const redirectTo = getRedirectUrl();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo,
      scopes: 'email profile openid',
      skipBrowserRedirect: Capacitor.isNativePlatform(),
    },
  });

  if (error) throw error;
  
  // On native, open the OAuth URL in the system browser
  if (Capacitor.isNativePlatform() && data.url) {
    await Browser.open({ url: data.url });
  }
  
  return data;
}

// OAuth sign in with Apple
export async function signInWithApple() {
  const redirectTo = getRedirectUrl();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo,
      skipBrowserRedirect: Capacitor.isNativePlatform(),
    },
  });

  if (error) throw error;
  
  // On native, open the OAuth URL in the system browser
  if (Capacitor.isNativePlatform() && data.url) {
    await Browser.open({ url: data.url });
  }
  
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
