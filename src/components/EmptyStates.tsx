import { Package, ShoppingCart, CheckCircle, Camera } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  type: 'inventory' | 'shopping' | 'alerts';
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const configs = {
    inventory: {
      icon: Package,
      title: "Your inventory is empty",
      description: "Start by scanning a receipt or adding items manually to track your groceries",
      actionLabel: "Add Items",
      illustration: "📦",
    },
    shopping: {
      icon: ShoppingCart,
      title: "Your shopping list is empty",
      description: "Items will appear here when you're running low or when you add them manually",
      actionLabel: "Add Item",
      illustration: "🛒",
    },
    alerts: {
      icon: CheckCircle,
      title: "No alerts right now",
      description: "Great! Nothing is expiring soon. We'll notify you when items need attention",
      actionLabel: null,
      illustration: "✅",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Illustration */}
      <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-6">
        <span className="text-5xl">{config.illustration}</span>
      </div>

      {/* Icon (alternative to illustration) */}
      {/* <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div> */}

      {/* Content */}
      <h2 className="text-2xl mb-2">{config.title}</h2>
      <p className="text-muted-foreground max-w-sm mb-6">
        {config.description}
      </p>

      {/* Action Button */}
      {config.actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          {config.actionLabel}
        </Button>
      )}
    </div>
  );
}
