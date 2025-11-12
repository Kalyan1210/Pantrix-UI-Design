import { useState } from "react";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { LoginScreen } from "./components/LoginScreen";
import { SignUpScreen } from "./components/SignUpScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
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
  const shoppingListCount = 7;

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

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setCurrentScreen('home');
  };

  const handleNavigate = (screen: string) => {
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
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'inventory':
        return (
          <InventoryScreen
            onItemClick={() => handleNavigate('itemDetail')}
            onAddItem={() => handleNavigate('addItem')}
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