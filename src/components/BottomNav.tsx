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
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50">
      {/* Extra padding to lift the nav bar up */}
      <div className="max-w-md mx-auto flex justify-around items-center px-2 pb-6 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isScan = tab.id === 'scan';
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 min-w-[60px] relative transition-all active:scale-95 ${
                isScan ? 'mt-[-20px]' : ''
              }`}
              aria-label={tab.label}
            >
              {isScan ? (
                <div className={`w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center transition-all ${
                  isActive ? 'scale-110 shadow-primary/40' : ''
                }`}
                style={{
                  boxShadow: isActive 
                    ? '0 4px 20px rgba(34, 197, 94, 0.4)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                >
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
                    {typeof tab.badge === 'number' && tab.badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-scale-in"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
      {/* Safe area padding - separate so nav content is above it */}
      <div className="safe-area-bottom" />
    </div>
  );
}
