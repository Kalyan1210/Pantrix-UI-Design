import { AlertCircle, TrendingDown, Package, Plus, Camera, List, ChevronRight, Bell, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { useState, useEffect } from "react";
import { getInventoryItems, calculateDaysUntilExpiry } from "../lib/inventory";
import { getCurrentUser } from "../lib/auth";
import { hapticLight, hapticMedium } from "../lib/haptics";
import { HomeScreenSkeleton } from "./ui/skeleton-loader";

interface HomeScreenProps {
  onNavigate: (screen: string, filter?: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Expiring Today', value: 0, icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', filter: 'expiring' },
    { label: 'Running Low', value: 0, icon: TrendingDown, color: 'text-secondary', bgColor: 'bg-secondary/10', filter: 'low' },
    { label: 'Total Items', value: 0, icon: Package, color: 'text-primary', bgColor: 'bg-primary/10', filter: 'all' },
  ]);
  const [hasItems, setHasItems] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const items = await getInventoryItems(user.id);
        
        // Calculate expiring today (0 days or less)
        const expiringToday = items.filter(item => {
          const days = calculateDaysUntilExpiry(item.expiry_date);
          return days !== null && days <= 0;
        }).length;

        // Calculate running low (quantity <= 2)
        const runningLow = items.filter(item => item.quantity <= 2).length;

        setStats([
          { label: 'Expiring Today', value: expiringToday, icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', filter: 'expiring' },
          { label: 'Running Low', value: runningLow, icon: TrendingDown, color: 'text-secondary', bgColor: 'bg-secondary/10', filter: 'low' },
          { label: 'Total Items', value: items.length, icon: Package, color: 'text-primary', bgColor: 'bg-primary/10', filter: 'all' },
        ]);
        
        setHasItems(items.length > 0);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleStatClick = (filter: string) => {
    hapticMedium();
    // Navigate to inventory with the filter applied
    onNavigate('inventory', filter);
  };
  
  const handleQuickAction = (screen: string) => {
    hapticLight();
    onNavigate(screen);
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto safe-area-top">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-3xl">{getGreeting()}</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative touch-feedback"
            onClick={() => {
              hapticLight();
              onNavigate('notifications');
            }}
          >
            <Bell className="w-5 h-5" />
            {/* Show badge only when there are expiring items */}
            {stats[0].value > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive badge-pulse">
                {stats[0].value}
              </Badge>
            )}
          </Button>
        </div>
        <p className="text-muted-foreground">Here's what's happening with your pantry</p>
      </div>

      {/* Urgent Alert */}
      {stats[0].value > 0 && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/5 animate-slide-in-bottom">
          <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
          <AlertDescription className="ml-2">
            <span className="font-medium">{stats[0].value} items expiring today</span> - Check your inventory to avoid waste
          </AlertDescription>
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-auto text-destructive hover:text-destructive touch-feedback"
            onClick={() => {
              hapticMedium();
              onNavigate('inventory', 'expiring');
            }}
          >
            View
          </Button>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isHighlighted = stat.filter === 'expiring' && stat.value > 0;
          return (
            <Card 
              key={index} 
              className={`p-4 text-center cursor-pointer card-interactive animate-scale-in stagger-${index + 1} ${isHighlighted ? 'ring-2 ring-destructive/30' : ''}`}
              onClick={() => handleStatClick(stat.filter)}
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} mx-auto mb-2 flex items-center justify-center transition-transform`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-2xl mb-1 ${isHighlighted ? 'text-destructive font-bold' : ''}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleQuickAction('scan')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all touch-feedback hover:scale-105"
          >
            <Camera className="w-6 h-6 text-primary mb-2" />
            <span className="text-sm">Capture</span>
          </button>
          <button
            onClick={() => handleQuickAction('addItem')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-all touch-feedback hover:scale-105"
          >
            <Plus className="w-6 h-6 text-accent mb-2" />
            <span className="text-sm">Add Item</span>
          </button>
          <button
            onClick={() => handleQuickAction('shopping')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all touch-feedback hover:scale-105"
          >
            <List className="w-6 h-6 text-secondary mb-2" />
            <span className="text-sm">Shopping List</span>
          </button>
        </div>
      </div>

      {/* Getting Started / Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2>{hasItems ? 'Your Pantry' : 'Get Started'}</h2>
          {hasItems && (
            <Button variant="ghost" size="sm" className="touch-feedback" onClick={() => {
              hapticLight();
              onNavigate('inventory');
            }}>
              See all
            </Button>
          )}
        </div>
        {hasItems ? (
          <Card className="p-4 card-interactive">
            <button
              onClick={() => {
                hapticLight();
                onNavigate('inventory');
              }}
              className="w-full flex items-center gap-3 text-left rounded-lg -m-2 p-2"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{stats[2].value} items in your pantry</p>
                <p className="text-muted-foreground text-sm">Tap to view inventory</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center animate-bounce-subtle">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Your pantry is empty</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Start by adding items manually or scan a receipt to get started!
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="sm" className="touch-feedback" onClick={() => {
                hapticMedium();
                onNavigate('addItem');
              }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
              <Button size="sm" variant="outline" className="touch-feedback" onClick={() => {
                hapticMedium();
                onNavigate('scan');
              }}>
                <Camera className="w-4 h-4 mr-1" />
                Capture
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Recipe Suggestions Card - When user has items */}
      {hasItems && (
        <Card 
          className="mt-6 p-4 bg-gradient-to-r from-secondary/10 to-primary/10 cursor-pointer card-interactive"
          onClick={() => {
            hapticLight();
            onNavigate('recipes');
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">What can I make?</h3>
              <p className="text-muted-foreground text-sm">Find recipes with your ingredients</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
      )}

      {/* Achievement Badge - Only show when user has items */}
      {hasItems && stats[2].value >= 5 && (
        <Card 
          className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="flex-1">
              <h3>Great job!</h3>
              <p className="text-muted-foreground">Keep tracking your items to reduce food waste!</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}