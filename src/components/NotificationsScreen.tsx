import * as React from "react";
import { ArrowLeft, AlertCircle, ShoppingCart, Users, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface NotificationsScreenProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'spoilage' | 'shopping' | 'household';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([
    {
      id: '1',
      type: 'spoilage',
      title: 'Items Expiring Soon',
      message: '3 items in your fridge are expiring today',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'household',
      title: 'Sarah added items',
      message: 'Sarah added milk and eggs to the shopping list',
      time: '3 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'spoilage',
      title: 'Strawberries expiring',
      message: 'Use your strawberries within 24 hours',
      time: '5 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'shopping',
      title: 'Running low on essentials',
      message: 'You have 4 items running low in your pantry',
      time: '1 day ago',
      read: true,
    },
    {
      id: '5',
      type: 'household',
      title: 'Mike joined household',
      message: 'Mike Johnson joined "The Doe Family"',
      time: '2 days ago',
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'spoilage':
        return { Icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' };
      case 'shopping':
        return { Icon: ShoppingCart, color: 'text-secondary', bgColor: 'bg-secondary/10' };
      case 'household':
        return { Icon: Users, color: 'text-accent', bgColor: 'bg-accent/10' };
      default:
        return { Icon: AlertCircle, color: 'text-muted-foreground', bgColor: 'bg-muted' };
    }
  };

  const todayNotifications = notifications.filter((_, i) => i < 2);
  const yesterdayNotifications = notifications.filter((_, i) => i >= 2 && i < 4);
  const olderNotifications = notifications.filter((_, i) => i >= 4);

  const renderNotification = (notification: Notification) => {
    const { Icon, color, bgColor } = getNotificationIcon(notification.type);
    
    return (
      <div
        key={notification.id}
        className={`p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors cursor-pointer ${
          !notification.read ? 'bg-primary/5' : ''
        }`}
      >
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3>{notification.title}</h3>
            {!notification.read && (
              <Badge className="bg-primary h-2 w-2 p-0 rounded-full" />
            )}
          </div>
          <p className="text-muted-foreground mb-1">{notification.message}</p>
          <span className="text-xs text-muted-foreground">{notification.time}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl flex-1">Notifications</h1>
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Today */}
        {todayNotifications.length > 0 && (
          <div className="mb-6">
            <h2 className="px-4 py-3 text-muted-foreground">Today</h2>
            <Card className="divide-y">
              {todayNotifications.map(renderNotification)}
            </Card>
          </div>
        )}

        {/* Yesterday */}
        {yesterdayNotifications.length > 0 && (
          <div className="mb-6">
            <h2 className="px-4 py-3 text-muted-foreground">Yesterday</h2>
            <Card className="divide-y">
              {yesterdayNotifications.map(renderNotification)}
            </Card>
          </div>
        )}

        {/* This Week */}
        {olderNotifications.length > 0 && (
          <div className="mb-6">
            <h2 className="px-4 py-3 text-muted-foreground">This Week</h2>
            <Card className="divide-y">
              {olderNotifications.map(renderNotification)}
            </Card>
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="px-4 pt-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="mb-2">No notifications</h2>
            <p className="text-muted-foreground">
              You're all caught up! We'll notify you when something needs your attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
