import * as React from "react";
import { ArrowLeft, AlertCircle, ShoppingCart, Users, Trash2, Package, Bell, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { getInventoryItems, calculateDaysUntilExpiry } from "../lib/inventory";
import { getCurrentUser } from "../lib/auth";
import { hapticLight, hapticMedium } from "../lib/haptics";
import { Skeleton } from "./ui/skeleton-loader";

interface NotificationsScreenProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'expiring' | 'expired' | 'low_stock' | 'shopping' | 'tip';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: number; // 1 = high, 2 = medium, 3 = low
  itemName?: string;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Generate notifications from inventory data
  React.useEffect(() => {
    const generateNotifications = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const items = await getInventoryItems(user.id);
        const now = new Date();
        const newNotifications: Notification[] = [];

        // Check each item for expiry and low stock
        items.forEach((item, index) => {
          const daysUntilExpiry = calculateDaysUntilExpiry(item.expiry_date);
          
          // Expired items - high priority
          if (daysUntilExpiry !== null && daysUntilExpiry <= 0) {
            newNotifications.push({
              id: `expired-${item.id}`,
              type: 'expired',
              title: `${item.name} has expired!`,
              message: `This item expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? 's' : ''} ago. Consider removing it.`,
              time: 'Now',
              read: false,
              priority: 1,
              itemName: item.name,
            });
          }
          // Expiring today
          else if (daysUntilExpiry === 0) {
            newNotifications.push({
              id: `expiring-today-${item.id}`,
              type: 'expiring',
              title: `${item.name} expires today!`,
              message: 'Use it before it goes bad.',
              time: 'Today',
              read: false,
              priority: 1,
              itemName: item.name,
            });
          }
          // Expiring in 1-2 days
          else if (daysUntilExpiry !== null && daysUntilExpiry <= 2) {
            newNotifications.push({
              id: `expiring-soon-${item.id}`,
              type: 'expiring',
              title: `${item.name} expiring soon`,
              message: `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Plan to use it!`,
              time: 'Today',
              read: false,
              priority: 2,
              itemName: item.name,
            });
          }
          // Expiring in 3-5 days (medium priority)
          else if (daysUntilExpiry !== null && daysUntilExpiry <= 5) {
            newNotifications.push({
              id: `expiring-week-${item.id}`,
              type: 'expiring',
              title: `${item.name} expiring this week`,
              message: `${daysUntilExpiry} days left. Consider using it soon.`,
              time: 'Earlier',
              read: true, // Lower priority ones start as read
              priority: 3,
              itemName: item.name,
            });
          }

          // Low stock items
          if (item.quantity <= 1) {
            newNotifications.push({
              id: `low-stock-${item.id}`,
              type: 'low_stock',
              title: `Running low on ${item.name}`,
              message: `Only ${item.quantity} left. Add to shopping list?`,
              time: 'Today',
              read: false,
              priority: 2,
              itemName: item.name,
            });
          }
        });

        // Add a tip notification if user has few items
        if (items.length < 3) {
          newNotifications.push({
            id: 'tip-add-items',
            type: 'tip',
            title: '💡 Pro Tip',
            message: 'Scan a grocery receipt to quickly add multiple items at once!',
            time: 'Just now',
            read: true,
            priority: 4,
          });
        }

        // Sort by priority
        newNotifications.sort((a, b) => a.priority - b.priority);

        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error generating notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateNotifications();
  }, []);

  const markAllAsRead = () => {
    hapticLight();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    hapticMedium();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expired':
        return { Icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' };
      case 'expiring':
        return { Icon: Clock, color: 'text-secondary', bgColor: 'bg-secondary/10' };
      case 'low_stock':
        return { Icon: Package, color: 'text-primary', bgColor: 'bg-primary/10' };
      case 'shopping':
        return { Icon: ShoppingCart, color: 'text-accent', bgColor: 'bg-accent/10' };
      case 'tip':
        return { Icon: Bell, color: 'text-muted-foreground', bgColor: 'bg-muted' };
      default:
        return { Icon: AlertCircle, color: 'text-muted-foreground', bgColor: 'bg-muted' };
    }
  };

  // Group notifications
  const highPriority = notifications.filter(n => n.priority === 1);
  const mediumPriority = notifications.filter(n => n.priority === 2);
  const lowPriority = notifications.filter(n => n.priority >= 3);

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = (notification: Notification, index: number) => {
    const { Icon, color, bgColor } = getNotificationIcon(notification.type);
    
    return (
      <div
        key={notification.id}
        className={`p-4 flex items-start gap-3 hover:bg-muted/50 transition-all cursor-pointer animate-slide-in-bottom ${
          !notification.read ? 'bg-primary/5' : ''
        }`}
        style={{ 
          animationDelay: `${index * 50}ms`,
          animationFillMode: 'forwards',
          opacity: 0
        }}
      >
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium">{notification.title}</h3>
            {!notification.read && (
              <Badge className="bg-primary h-2 w-2 p-0 rounded-full animate-pulse" />
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-1">{notification.message}</p>
          <span className="text-xs text-muted-foreground">{notification.time}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-destructive touch-feedback"
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
    <div className="min-h-screen bg-background pb-8 safe-area-top">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10 animate-fade-in">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="touch-feedback"
              onClick={() => {
                hapticLight();
                onBack();
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 flex items-center gap-2">
              <h1 className="text-xl font-medium">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="touch-feedback"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {isLoading ? (
          <div className="px-4 pt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Urgent - High Priority */}
            {highPriority.length > 0 && (
              <div className="mb-6">
                <h2 className="px-4 py-3 text-destructive font-medium text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Urgent
                </h2>
                <Card className="divide-y mx-4">
                  {highPriority.map((n, i) => renderNotification(n, i))}
                </Card>
              </div>
            )}

            {/* Recent - Medium Priority */}
            {mediumPriority.length > 0 && (
              <div className="mb-6">
                <h2 className="px-4 py-3 text-muted-foreground text-sm">Recent</h2>
                <Card className="divide-y mx-4">
                  {mediumPriority.map((n, i) => renderNotification(n, highPriority.length + i))}
                </Card>
              </div>
            )}

            {/* Earlier - Low Priority */}
            {lowPriority.length > 0 && (
              <div className="mb-6">
                <h2 className="px-4 py-3 text-muted-foreground text-sm">Earlier</h2>
                <Card className="divide-y mx-4">
                  {lowPriority.map((n, i) => renderNotification(n, highPriority.length + mediumPriority.length + i))}
                </Card>
              </div>
            )}

            {/* Empty State */}
            {notifications.length === 0 && (
              <div className="px-4 pt-12 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">🎉</span>
                </div>
                <h2 className="mb-2 font-medium">All caught up!</h2>
                <p className="text-muted-foreground text-sm">
                  No notifications right now. We'll let you know when items are expiring or running low.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
