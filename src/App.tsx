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
            onItemClick={(item) => {
              setSelectedItem(item);
              handleNavigate('itemDetail');
            }}
            onAddItem={() => handleNavigate('addItem')}
            initialFilter={inventoryFilter}
          />
        );
      case 'itemDetail':
        return (
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