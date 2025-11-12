import { AlertCircle, TrendingDown, Package, Plus, Camera, List, ChevronRight, Bell } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const stats = [
    { label: 'Expiring Today', value: 3, icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { label: 'Running Low', value: 7, icon: TrendingDown, color: 'text-secondary', bgColor: 'bg-secondary/10' },
    { label: 'Total Items', value: 42, icon: Package, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  const recentActivity = [
    { action: 'Added 3 items', detail: 'From receipt scan', time: '2 hours ago' },
    { action: 'Sarah added milk', detail: 'To shopping list', time: '3 hours ago' },
    { action: '2 items expiring soon', detail: 'Strawberries, Yogurt', time: '5 hours ago' },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-3xl">Good morning</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => onNavigate('notifications')}
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
              2
            </Badge>
          </Button>
        </div>
        <p className="text-muted-foreground">Here's what's happening with your pantry</p>
      </div>

      {/* Urgent Alert */}
      <Alert className="mb-6 border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <AlertDescription className="ml-2">
          <span className="font-medium">3 items expiring today</span> - Check your inventory to avoid waste
        </AlertDescription>
        <Button 
          size="sm" 
          variant="ghost" 
          className="ml-auto text-destructive hover:text-destructive"
          onClick={() => onNavigate('inventory')}
        >
          View
        </Button>
      </Alert>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 text-center">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} mx-auto mb-2 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl mb-1">{stat.value}</div>
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
            onClick={() => onNavigate('scan')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <Camera className="w-6 h-6 text-primary mb-2" />
            <span className="text-sm">Scan Receipt</span>
          </button>
          <button
            onClick={() => onNavigate('inventory')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-accent/10 hover:bg-accent/20 transition-colors"
          >
            <Plus className="w-6 h-6 text-accent mb-2" />
            <span className="text-sm">Add Item</span>
          </button>
          <button
            onClick={() => onNavigate('shopping')}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors"
          >
            <List className="w-6 h-6 text-secondary mb-2" />
            <span className="text-sm">Shopping List</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2>Recent Activity</h2>
          <Button variant="ghost" size="sm">
            See all
          </Button>
        </div>
        <Card className="divide-y">
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <p className="mb-1">{activity.action}</p>
                <p className="text-muted-foreground">{activity.detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{activity.time}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Achievement Badge */}
      <Card className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎉</span>
          </div>
          <div className="flex-1">
            <h3>Great job!</h3>
            <p className="text-muted-foreground">You've prevented $47 worth of food waste this month</p>
          </div>
        </div>
      </Card>
    </div>
  );
}