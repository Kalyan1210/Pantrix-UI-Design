// API Configuration for cross-platform support
// Uses Vercel backend on native platforms, relative URLs on web

import { Capacitor } from '@capacitor/core';

// Production Vercel URL
const VERCEL_URL = 'https://pantrix-coral.vercel.app';

/**
 * Get the base URL for API calls
 * - On native platforms (iOS/Android): Use full Vercel URL
 * - On web: Use relative URLs (works with both local dev and Vercel)
 */
export function getApiBaseUrl(): string {
  if (Capacitor.isNativePlatform()) {
    return VERCEL_URL;
  }
  return '';
}

/**
 * Build full API URL for a given endpoint
 * @param endpoint - The API endpoint (e.g., '/api/generate-recipes')
 * @returns Full URL for the API call
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
}

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get platform name
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}
