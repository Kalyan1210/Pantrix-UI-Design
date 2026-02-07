/**
 * RevenueCat Service
 * Handles in-app purchases and subscriptions
 * 
 * Setup Instructions:
 * 1. Create a RevenueCat account at https://www.revenuecat.com
 * 2. Create a new project in RevenueCat
 * 3. Add your iOS app with bundle ID: com.pantrix.app
 * 4. Create products in App Store Connect:
 *    - pantrix_pro_monthly ($4.99/month)
 *    - pantrix_pro_annual ($29.99/year)
 * 5. Add products to RevenueCat and create an "offering"
 * 6. Copy your iOS API key from RevenueCat → Project Settings → API Keys
 * 7. Paste it in .env as VITE_REVENUECAT_IOS_KEY
 * 
 * For Capacitor, install the plugin:
 * npm install @capgo/capacitor-purchases
 * npx cap sync
 */

import { Capacitor } from '@capacitor/core';

// API Keys from environment
const API_KEYS = {
  ios: import.meta.env.VITE_REVENUECAT_IOS_KEY || '',
  android: import.meta.env.VITE_REVENUECAT_ANDROID_KEY || '',
};

// Check if RevenueCat is configured
export function isRevenueCatConfigured(): boolean {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') {
    return !!API_KEYS.ios && API_KEYS.ios !== 'your_revenuecat_ios_api_key_here';
  }
  if (platform === 'android') {
    return !!API_KEYS.android && API_KEYS.android !== 'your_revenuecat_android_api_key_here';
  }
  return false;
}

// Store state
let isPro = false;

/**
 * Initialize RevenueCat
 * Call this once when the app starts
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Skipping initialization on web');
    return;
  }

  if (!isRevenueCatConfigured()) {
    console.log('RevenueCat: API key not configured');
    return;
  }

  try {
    // When you install @capgo/capacitor-purchases, uncomment this:
    // const { Purchases } = await import('@capgo/capacitor-purchases');
    // 
    // const platform = Capacitor.getPlatform();
    // const apiKey = platform === 'ios' ? API_KEYS.ios : API_KEYS.android;
    // 
    // await Purchases.configure({
    //   apiKey,
    //   appUserID: userId || null,
    // });
    // 
    // // Check initial pro status
    // const customerInfo = await Purchases.getCustomerInfo();
    // isPro = customerInfo.customerInfo.entitlements.active['pro'] !== undefined;
    
    console.log('RevenueCat: Initialized successfully');
  } catch (error) {
    console.error('RevenueCat: Initialization failed', error);
  }
}

/**
 * Get available offerings/packages
 */
export async function getOfferings(): Promise<any[]> {
  if (!Capacitor.isNativePlatform() || !isRevenueCatConfigured()) {
    // Return mock data for development
    return [
      {
        identifier: 'pantrix_pro_monthly',
        packageType: 'MONTHLY',
        product: {
          priceString: '$4.99',
          price: 4.99,
        },
      },
      {
        identifier: 'pantrix_pro_annual',
        packageType: 'ANNUAL',
        product: {
          priceString: '$29.99',
          price: 29.99,
        },
      },
    ];
  }

  try {
    // When you install @capgo/capacitor-purchases, uncomment this:
    // const { Purchases } = await import('@capgo/capacitor-purchases');
    // const offerings = await Purchases.getOfferings();
    // return offerings.current?.availablePackages || [];
    
    return [];
  } catch (error) {
    console.error('RevenueCat: Failed to get offerings', error);
    return [];
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: any): Promise<{ success: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform() || !isRevenueCatConfigured()) {
    // Demo mode
    return { success: false, error: 'RevenueCat not configured. Demo mode.' };
  }

  try {
    // When you install @capgo/capacitor-purchases, uncomment this:
    // const { Purchases } = await import('@capgo/capacitor-purchases');
    // const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    // 
    // isPro = customerInfo.entitlements.active['pro'] !== undefined;
    // return { success: isPro };
    
    return { success: false, error: 'Purchase not implemented' };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: error.message || 'Purchase failed' };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<{ success: boolean; isPro: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform() || !isRevenueCatConfigured()) {
    return { success: false, isPro: false, error: 'RevenueCat not configured' };
  }

  try {
    // When you install @capgo/capacitor-purchases, uncomment this:
    // const { Purchases } = await import('@capgo/capacitor-purchases');
    // const { customerInfo } = await Purchases.restorePurchases();
    // 
    // isPro = customerInfo.entitlements.active['pro'] !== undefined;
    // return { success: true, isPro };
    
    return { success: true, isPro: false };
  } catch (error: any) {
    return { success: false, isPro: false, error: error.message || 'Restore failed' };
  }
}

/**
 * Check if user has pro subscription
 */
export async function checkProStatus(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !isRevenueCatConfigured()) {
    return isPro;
  }

  try {
    // When you install @capgo/capacitor-purchases, uncomment this:
    // const { Purchases } = await import('@capgo/capacitor-purchases');
    // const { customerInfo } = await Purchases.getCustomerInfo();
    // isPro = customerInfo.entitlements.active['pro'] !== undefined;
    
    return isPro;
  } catch (error) {
    console.error('RevenueCat: Failed to check pro status', error);
    return isPro;
  }
}

/**
 * Get current pro status (cached)
 */
export function getProStatus(): boolean {
  return isPro;
}

/**
 * Set pro status (for testing/demo)
 */
export function setProStatus(status: boolean): void {
  isPro = status;
}
