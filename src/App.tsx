import { useState, useEffect, useRef } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LoginScreen } from "./components/LoginScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { OnboardingCarousel } from "./components/OnboardingCarousel";
import { HomeScreen } from "./components/HomeScreen";
import { InventoryScreen } from "./components/InventoryScreen";
import { ItemDetailScreen } from "./components/ItemDetailScreen";
import { ReceiptScanScreen } from "./components/ReceiptScanScreen";
import { ShoppingListScreen } from "./components/ShoppingListScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { HouseholdScreen } from "./components/HouseholdScreen";
import { SpoilageAlertsScreen } from "./components/SpoilageAlertsScreen";
import { RecipesScreen } from "./components/RecipesScreen";
import { AddItemScreen } from "./components/AddItemScreen";
import { AddShoppingItemScreen } from "./components/AddShoppingItemScreen";
import { NotificationsScreen } from "./components/NotificationsScreen";
import { AnimatedSplashScreen } from "./components/AnimatedSplashScreen";
import { BottomNav } from "./components/BottomNav";
import { Toaster } from "./components/ui/sonner";
import { getCurrentUser, onAuthStateChange } from "./lib/auth";
import { PageTransition } from "./components/ui/page-transition";
import { hapticMedium, hapticSuccess } from "./lib/haptics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Download, X } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { supabase } from "./lib/supabase";

type Screen = 
  | 'welcome' 
  | 'login'
  | 'signup'
  | 'onboarding'
  | 'home' 
  | 'inventory' 
  | 'scan' 
  | 'shopping' 
  | 'settings'
  | 'itemDetail'
  | 'household'
  | 'spoilageAlerts'
  | 'recipes'
  | 'addItem'
  | 'addShoppingItem'
  | 'notifications';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingListCount, setShoppingListCount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const previousScreen = useRef<Screen>('welcome');
  const [transitionKey, setTransitionKey] = useState(0);
  
  // PWA Install Prompt
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if user hasn't dismissed it before
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        // Delay showing the prompt
        setTimeout(() => setShowInstallPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle deep links for OAuth on native platforms
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Handle deep link when app opens from URL
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      // Check if this is an OAuth callback
      if (url.includes('auth/callback') || url.includes('access_token') || url.includes('code=')) {
        try {
          // Close the browser if it's open
          await Browser.close();
          
          // Extract tokens from URL
          const urlObj = new URL(url.replace('pantrix://', 'https://'));
          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          const queryParams = urlObj.searchParams;
          
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Error setting session:', error);
            } else {
              console.log('OAuth session set successfully');
              setIsAuthenticated(true);
              // Check onboarding
              const user = await getCurrentUser();
              if (user) {
                const hasOnboarding = localStorage.getItem(`onboarding_${user.id}`) === 'completed';
                setHasCompletedOnboarding(hasOnboarding);
                setCurrentScreen(hasOnboarding ? 'home' : 'onboarding');
              }
            }
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
        }
      }
    };

    // Listen for app URL open events
    CapacitorApp.addListener('appUrlOpen', (event) => {
      handleDeepLink(event.url);
    });

    // Check if the app was opened with a URL (cold start)
    CapacitorApp.getLaunchUrl().then((result) => {
      if (result?.url) {
        handleDeepLink(result.url);
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []);
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    hapticSuccess();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };
  
  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };
  
  // Determine transition direction based on navigation
  const getTransitionDirection = (from: Screen, to: Screen): 'left' | 'right' | 'bottom' | 'scale' => {
    const mainScreens: Screen[] = ['home', 'inventory', 'scan', 'shopping', 'settings'];
    const fromIndex = mainScreens.indexOf(from);
    const toIndex = mainScreens.indexOf(to);
    
    // Going to sub-screens (detail, add, etc.)
    if (['itemDetail', 'addItem', 'addShoppingItem', 'notifications', 'household', 'spoilageAlerts', 'recipes'].includes(to)) {
      return 'right';
    }
    
    // Coming back from sub-screens
    if (['itemDetail', 'addItem', 'addShoppingItem', 'notifications', 'household', 'spoilageAlerts', 'recipes'].includes(from)) {
      return 'left';
    }
    
    // Navigating between main tabs
    if (fromIndex >= 0 && toIndex >= 0) {
      return toIndex > fromIndex ? 'right' : 'left';
    }
    
    return 'scale';
  };
  
  const navigateToScreen = (screen: Screen) => {
    previousScreen.current = currentScreen;
    setCurrentScreen(screen);
    setTransitionKey(prev => prev + 1);
    hapticMedium();
  };
  
  // Load shopping list count from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shopping_list_items');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        const activeItems = items.filter((item: any) => !item.completed);
        setShoppingListCount(activeItems.length);
      } catch (e) {
        console.error('Error loading shopping list count:', e);
      }
    }
  }, [currentScreen]); // Re-check when screen changes

  // Check authentication state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
          // Check if user has completed onboarding (you can store this in user metadata)
          const hasOnboarding = localStorage.getItem(`onboarding_${user.id}`) === 'completed';
          setHasCompletedOnboarding(hasOnboarding);
          if (hasOnboarding) {
            setCurrentScreen('home');
          } else {
            setCurrentScreen('onboarding');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        setCurrentScreen('welcome');
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGetStarted = () => {
    navigateToScreen('login');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    if (!hasCompletedOnboarding) {
      navigateToScreen('onboarding');
    } else {
      navigateToScreen('home');
    }
  };

  const handleSignUp = () => {
    // In a real app, this would navigate to a signup screen
    setIsAuthenticated(true);
    navigateToScreen('onboarding');
  };

  const handleShowSignUp = () => {
    navigateToScreen('signup');
  };

  const handleBackToLogin = () => {
    navigateToScreen('login');
  };

  const handleOnboardingComplete = async () => {
    setHasCompletedOnboarding(true);
    const user = await getCurrentUser();
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'completed');
    }
    setCurrentScreen('home');
  };

  const [inventoryFilter, setInventoryFilter] = useState<string | undefined>(undefined);

  const handleNavigate = (screen: string, filter?: string) => {
    if (screen === 'inventory' && filter) {
      setInventoryFilter(filter);
    }
    switch (screen) {
      case 'home':
      case 'inventory':
      case 'scan':
      case 'shopping':
      case 'settings':
      case 'spoilageAlerts':
      case 'recipes':
      case 'household':
      case 'itemDetail':
      case 'addItem':
      case 'addShoppingItem':
      case 'notifications':
        navigateToScreen(screen as Screen);
        break;
    }
  };

  const handleBack = () => {
    // Simple navigation back logic
    if (currentScreen === 'itemDetail' || currentScreen === 'addItem') {
      navigateToScreen('inventory');
    } else if (currentScreen === 'addShoppingItem') {
      navigateToScreen('shopping');
    } else if (currentScreen === 'household') {
      navigateToScreen('settings');
    } else if (currentScreen === 'spoilageAlerts' || currentScreen === 'recipes' || currentScreen === 'notifications') {
      navigateToScreen('home');
    } else {
      navigateToScreen('home');
    }
  };

  const renderScreen = () => {
    const direction = getTransitionDirection(previousScreen.current, currentScreen);
    
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'welcome':
          return (
            <PageTransition key={transitionKey} direction="scale">
              <WelcomeScreen onGetStarted={handleGetStarted} />
            </PageTransition>
          );
        case 'login':
          return (
            <PageTransition key={transitionKey} direction="right">
              <LoginScreen onLogin={handleLogin} onSignUp={handleShowSignUp} />
            </PageTransition>
          );
        case 'signup':
          return (
            <PageTransition key={transitionKey} direction="right">
              <SignUpScreen onSignUp={handleSignUp} onBack={handleBackToLogin} />
            </PageTransition>
          );
        default:
          return (
            <PageTransition key={transitionKey} direction="scale">
              <WelcomeScreen onGetStarted={handleGetStarted} />
            </PageTransition>
          );
      }
    }

    if (currentScreen === 'onboarding') {
      return (
        <PageTransition key={transitionKey} direction="scale">
          <OnboardingCarousel onComplete={handleOnboardingComplete} />
        </PageTransition>
      );
    }

    switch (currentScreen) {
      case 'home':
        return (
          <PageTransition key={transitionKey} direction={direction}>
            <HomeScreen onNavigate={handleNavigate} />
          </PageTransition>
        );
      case 'inventory':
        return (
          <PageTransition key={transitionKey} direction={direction}>
            <InventoryScreen
              onItemClick={(item) => {
                setSelectedItem(item);
                handleNavigate('itemDetail');
              }}
              onAddItem={() => handleNavigate('addItem')}
              initialFilter={inventoryFilter}
            />
          </PageTransition>
        );
      case 'itemDetail':
        return (
          <PageTransition key={transitionKey} direction="right">
            <ItemDetailScreen
              item={selectedItem}
              onBack={handleBack}
              onDelete={() => {
                // Toast notification would go here
                handleBack();
              }}
              onAddToShoppingList={() => {
                // Toast notification would go here
                handleBack();
              }}
            />
          </PageTransition>
        );
      case 'addItem':
        return (
          <PageTransition key={transitionKey} direction="right">
            <AddItemScreen
              onBack={handleBack}
              onSave={() => {
                // Toast notification would go here
                handleBack();
              }}
              onScanBarcode={() => handleNavigate('scan')}
            />
          </PageTransition>
        );
      case 'addShoppingItem':
        return (
          <PageTransition key={transitionKey} direction="right">
            <AddShoppingItemScreen
              onBack={handleBack}
              onSave={() => {
                handleBack();
              }}
            />
          </PageTransition>
        );
      case 'scan':
        return (
          <PageTransition key={transitionKey} direction="bottom">
            <ReceiptScanScreen
              onBack={handleBack}
              onComplete={() => handleNavigate('inventory')}
            />
          </PageTransition>
        );
      case 'shopping':
        return (
          <PageTransition key={transitionKey} direction={direction}>
            <ShoppingListScreen onAddItem={() => handleNavigate('addShoppingItem')} />
          </PageTransition>
        );
      case 'settings':
        return (
          <PageTransition key={transitionKey} direction={direction}>
            <SettingsScreen onNavigateToHousehold={() => handleNavigate('household')} />
          </PageTransition>
        );
      case 'household':
        return (
          <PageTransition key={transitionKey} direction="right">
            <HouseholdScreen onBack={handleBack} />
          </PageTransition>
        );
      case 'spoilageAlerts':
        return (
          <PageTransition key={transitionKey} direction="right">
            <SpoilageAlertsScreen onViewRecipes={() => handleNavigate('recipes')} />
          </PageTransition>
        );
      case 'recipes':
        return (
          <PageTransition key={transitionKey} direction="right">
            <RecipesScreen onBack={handleBack} />
          </PageTransition>
        );
      case 'notifications':
        return (
          <PageTransition key={transitionKey} direction="right">
            <NotificationsScreen onBack={handleBack} />
          </PageTransition>
        );
      default:
        return (
          <PageTransition key={transitionKey} direction="scale">
            <HomeScreen onNavigate={handleNavigate} />
          </PageTransition>
        );
    }
  };

  const showBottomNav = isAuthenticated && 
    !['welcome', 'login', 'signup', 'onboarding', 'itemDetail', 'household', 'spoilageAlerts', 'recipes', 'addItem', 'addShoppingItem', 'notifications'].includes(currentScreen);

  if (isLoading) {
    return <AnimatedSplashScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* PWA Install Banner */}
        {showInstallPrompt && (
          <div className="fixed top-0 left-0 right-0 z-50 animate-slide-in-bottom">
            <div className="max-w-md mx-auto">
              <div className="m-4 p-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Install Pantrix</p>
                  <p className="text-sm text-white/80">Add to home screen for the best experience</p>
                </div>
                <button 
                  onClick={handleInstallClick}
                  className="px-4 py-2 rounded-lg bg-white text-primary font-medium text-sm touch-feedback"
                >
                  Install
                </button>
                <button 
                  onClick={dismissInstallPrompt}
                  className="p-2 rounded-lg hover:bg-white/20 touch-feedback"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Viewport Container - Max width for mobile app feel */}
        <div className="max-w-md mx-auto min-h-screen bg-background shadow-xl">
          {/* Main Content */}
          <div className="relative">
            {renderScreen()}
          </div>

          {/* Bottom Navigation */}
          {showBottomNav && (
            <BottomNav
              activeTab={currentScreen}
              onTabChange={(tab) => handleNavigate(tab)}
              shoppingListCount={shoppingListCount}
            />
          )}
        </div>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}