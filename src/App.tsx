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
import { NotificationsScreen } from "./components/NotificationsScreen";
import { BottomNav } from "./components/BottomNav";
import { Toaster } from "./components/ui/sonner";
import { getCurrentUser, onAuthStateChange } from "./lib/auth";
import { PageTransition } from "./components/ui/page-transition";
import { hapticMedium, hapticSuccess } from "./lib/haptics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Download, X } from "lucide-react";
// Loader2 removed - using custom emoji animation

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
    if (['itemDetail', 'addItem', 'notifications', 'household', 'spoilageAlerts', 'recipes'].includes(to)) {
      return 'right';
    }
    
    // Coming back from sub-screens
    if (['itemDetail', 'addItem', 'notifications', 'household', 'spoilageAlerts', 'recipes'].includes(from)) {
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
      case 'notifications':
        navigateToScreen(screen as Screen);
        break;
    }
  };

  const handleBack = () => {
    // Simple navigation back logic
    if (currentScreen === 'itemDetail' || currentScreen === 'addItem') {
      navigateToScreen('inventory');
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
            <ShoppingListScreen onAddItem={() => handleNavigate('addItem')} />
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
    !['welcome', 'login', 'signup', 'onboarding', 'itemDetail', 'household', 'spoilageAlerts', 'recipes', 'addItem', 'notifications'].includes(currentScreen);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
        <style>{`
          @keyframes springIn {
            0% {
              opacity: 0;
              transform: scale(0.2) rotate(-180deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.2) rotate(10deg);
            }
            70% {
              transform: scale(0.9) rotate(-5deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotate(0deg);
            }
          }
          
          @keyframes gentleSpinPulse {
            0%, 100% {
              transform: scale(1) rotate(0deg);
            }
            25% {
              transform: scale(1.08) rotate(5deg);
            }
            50% {
              transform: scale(1.15) rotate(0deg);
            }
            75% {
              transform: scale(1.08) rotate(-5deg);
            }
          }
          
          @keyframes textSlideUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          .emoji-loading {
            font-size: 120px;
            animation: springIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, 
                       gentleSpinPulse 2s ease-in-out 0.5s infinite;
            filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
          }
          
          .text-loading {
            animation: textSlideUp 0.4s ease-out 0.3s forwards;
            opacity: 0;
            background: linear-gradient(90deg, hsl(var(--foreground)) 40%, hsl(var(--primary)) 50%, hsl(var(--foreground)) 60%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: textSlideUp 0.4s ease-out 0.3s forwards, shimmer 3s linear 0.7s infinite;
          }
          
          .loader-dot {
            animation: gentleSpinPulse 1.5s ease-in-out infinite;
          }
        `}</style>
        <div className="flex flex-col items-center">
          <div className="emoji-loading mb-6">🥗</div>
          <h1 className="text-4xl font-bold text-loading tracking-tight">Pantrix</h1>
          <p className="text-muted-foreground mt-3 text-sm" style={{ animation: 'textSlideUp 0.4s ease-out 0.5s forwards', opacity: 0 }}>
            Your smart pantry companion
          </p>
        </div>
      </div>
    );
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