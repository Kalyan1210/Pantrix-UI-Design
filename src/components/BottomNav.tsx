import { Home, LayoutGrid, Camera, ShoppingCart, Settings } from "lucide-react";
import { Badge } from "./ui/badge";

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center px-2 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isScan = tab.id === 'scan';
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-3 px-4 min-w-[60px] relative transition-colors ${
                isScan ? 'mt-[-16px]' : ''
              }`}
              aria-label={tab.label}
            >
              {isScan ? (
                <div className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center mb-1">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    {tab.badge && tab.badge > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
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
    </div>
  );
}
