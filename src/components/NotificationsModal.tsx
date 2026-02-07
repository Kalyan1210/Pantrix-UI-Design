import React, { useState } from 'react';
import { Bell, X, AlertTriangle, Package, Clock, Trash2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { IOSModal } from './ui/ios-modal';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'expiring' | 'expired' | 'low_stock' | 'tip';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample notifications for demo
const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'expiring',
    title: 'Items Expiring Soon',
    message: 'Milk and Yogurt will expire in 2 days',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'expired',
    title: 'Item Expired',
    message: 'Bread has expired. Consider removing it.',
    time: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'You\'re running low on Eggs (2 remaining)',
    time: '2 days ago',
    read: true,
  },
  {
    id: '4',
    type: 'tip',
    title: 'Weekly Tip',
    message: 'Store bananas separately to prevent other fruits from ripening too fast.',
    time: '3 days ago',
    read: true,
  },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'expiring':
      return (
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
      );
    case 'expired':
      return (
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
      );
    case 'low_stock':
      return (
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-blue-500" />
        </div>
      );
    case 'tip':
      return (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
      );
  }
};

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClearAll = () => {
    hapticMedium();
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const handleMarkAllRead = () => {
    hapticLight();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDismiss = (id: string) => {
    hapticLight();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    hapticLight();
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <IOSModal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="flex flex-col h-full">
        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="text-sm text-destructive font-medium hover:text-destructive/80 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">All caught up!</h3>
              <p className="text-muted-foreground text-sm text-center">
                You have no notifications at the moment.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-4 flex gap-3 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <NotificationIcon type={notification.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.time}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="p-1.5 rounded-full hover:bg-muted transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-primary font-medium mt-2 hover:text-primary/80 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="px-4 py-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </IOSModal>
  );
}

// Export hook for notification count (can be used for badge)
export function useNotificationCount() {
  // In a real app, this would fetch from API/state management
  return SAMPLE_NOTIFICATIONS.filter(n => !n.read).length;
}
