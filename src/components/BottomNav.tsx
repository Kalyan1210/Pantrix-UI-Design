import { Home, LayoutGrid, Camera, ShoppingCart, Settings } from "lucide-react";
import { Badge } from "./ui/badge";
import { hapticLight, hapticMedium } from "../lib/haptics";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  shoppingListCount?: number;
}

export function BottomNav({ activeTab, onTabChange, shoppingListCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'inventory', icon: LayoutGrid, label: 'Inventory' },
    { id: 'scan', icon: Camera, label: 'Capture' },
    { id: 'shopping', icon: ShoppingCart, label: 'Shopping', badge: shoppingListCount },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabClick = (tabId: string) => {
    // Different haptic for scan button vs regular tabs
    if (tabId === 'scan') {
      hapticMedium();
    } else {
      hapticLight();
    }
    onTabChange(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 safe-area-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isScan = tab.id === 'scan';
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-3 px-4 min-w-[60px] relative transition-all touch-feedback ${
                isScan ? 'mt-[-16px]' : ''
              }`}
              aria-label={tab.label}
            >
              {isScan ? (
                <div className={`w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center mb-1 transition-transform ${
                  isActive ? 'scale-110' : 'hover:scale-105'
                }`}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-6 h-6 transition-all duration-200 ${
                        isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                      }`}
                    />
                    {tab.badge && tab.badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-scale-in"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 transition-colors duration-200 ${
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.label}
                  </span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary animate-scale-in" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
