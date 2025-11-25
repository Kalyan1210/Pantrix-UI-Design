import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

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
  const shoppingListCount = 7;

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
    setCurrentScreen('login');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    if (!hasCompletedOnboarding) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleSignUp = () => {
    // In a real app, this would navigate to a signup screen
    setIsAuthenticated(true);
    setCurrentScreen('onboarding');
  };

  const handleShowSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
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
        setCurrentScreen(screen as Screen);
        break;
      case 'spoilageAlerts':
      case 'recipes':
      case 'household':
      case 'itemDetail':
      case 'addItem':
      case 'notifications':
        setCurrentScreen(screen as Screen);
        break;
    }
  };

  const handleBack = () => {
    // Simple navigation back logic
    if (currentScreen === 'itemDetail' || currentScreen === 'addItem') {
      setCurrentScreen('inventory');
    } else if (currentScreen === 'household') {
      setCurrentScreen('settings');
    } else if (currentScreen === 'spoilageAlerts' || currentScreen === 'recipes' || currentScreen === 'notifications') {
      setCurrentScreen('home');
    } else {
      setCurrentScreen('home');
    }
  };

  const renderScreen = () => {
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'welcome':
          return <WelcomeScreen onGetStarted={handleGetStarted} />;
        case 'login':
          return <LoginScreen onLogin={handleLogin} onSignUp={handleShowSignUp} />;
        case 'signup':
          return <SignUpScreen onSignUp={handleSignUp} onBack={handleBackToLogin} />;
        default:
          return <WelcomeScreen onGetStarted={handleGetStarted} />;
      }
    }

    if (currentScreen === 'onboarding') {
      return <OnboardingCarousel onComplete={handleOnboardingComplete} />;
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'inventory':
        return (
          <InventoryScreen
            onItemClick={() => handleNavigate('itemDetail')}
            onAddItem={() => handleNavigate('addItem')}
            initialFilter={inventoryFilter}
          />
        );
      case 'itemDetail':
        return (
          <ItemDetailScreen
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
        );
      case 'addItem':
        return (
          <AddItemScreen
            onBack={handleBack}
            onSave={() => {
              // Toast notification would go here
              handleBack();
            }}
            onScanBarcode={() => handleNavigate('scan')}
          />
        );
      case 'scan':
        return (
          <ReceiptScanScreen
            onBack={handleBack}
            onComplete={() => handleNavigate('inventory')}
          />
        );
      case 'shopping':
        return <ShoppingListScreen onAddItem={() => handleNavigate('addItem')} />;
      case 'settings':
        return (
          <SettingsScreen onNavigateToHousehold={() => handleNavigate('household')} />
        );
      case 'household':
        return <HouseholdScreen onBack={handleBack} />;
      case 'spoilageAlerts':
        return (
          <SpoilageAlertsScreen onViewRecipes={() => handleNavigate('recipes')} />
        );
      case 'recipes':
        return <RecipesScreen onBack={handleBack} />;
      case 'notifications':
        return <NotificationsScreen onBack={handleBack} />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  const showBottomNav = isAuthenticated && 
    !['welcome', 'login', 'signup', 'onboarding', 'itemDetail', 'household', 'spoilageAlerts', 'recipes', 'addItem', 'notifications'].includes(currentScreen);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <style>{`
          @keyframes fadeInSpin {
            0% {
              opacity: 0;
              transform: scale(0.3) rotate(0deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotate(360deg);
            }
          }
          
          @keyframes spinPulse {
            0% {
              transform: rotate(0deg) scale(1);
            }
            25% {
              transform: rotate(90deg) scale(1.1);
            }
            50% {
              transform: rotate(180deg) scale(1);
            }
            75% {
              transform: rotate(270deg) scale(1.1);
            }
            100% {
              transform: rotate(360deg) scale(1);
            }
          }
          
          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          
          .emoji-loading {
            animation: fadeInSpin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, 
                       spinPulse 3s ease-in-out 0.8s infinite;
          }
          
          .text-loading {
            animation: fadeIn 0.6s ease-out 0.3s forwards;
            opacity: 0;
          }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="text-8xl mb-4 emoji-loading">🥗</div>
          <h1 className="text-4xl font-semibold text-foreground mb-8 text-loading">Pantrix</h1>
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
  );
}