import { useState } from "react";
import { Plus, Share2, SlidersHorizontal, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface ShoppingListScreenProps {
  onAddItem: () => void;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  priority: 'urgent' | 'normal';
  reason: 'expiring' | 'low' | 'manual';
  completed: boolean;
}

export function ShoppingListScreen({ onAddItem }: ShoppingListScreenProps) {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: '1', name: 'Milk', quantity: 1, category: 'Dairy', priority: 'urgent', reason: 'expiring', completed: false },
    { id: '2', name: 'Strawberries', quantity: 1, category: 'Produce', priority: 'urgent', reason: 'expiring', completed: false },
    { id: '3', name: 'Eggs', quantity: 12, category: 'Dairy', priority: 'normal', reason: 'low', completed: false },
    { id: '4', name: 'Bread', quantity: 1, category: 'Bakery', priority: 'normal', reason: 'low', completed: false },
    { id: '5', name: 'Chicken Breast', quantity: 2, category: 'Meat', priority: 'normal', reason: 'manual', completed: true },
    { id: '6', name: 'Lettuce', quantity: 1, category: 'Produce', priority: 'normal', reason: 'manual', completed: false },
    { id: '7', name: 'Yogurt', quantity: 4, category: 'Dairy', priority: 'urgent', reason: 'low', completed: false },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const getReasonBadge = (reason: string) => {
    if (reason === 'expiring') return { label: 'Expiring Soon', variant: 'destructive' as const };
    if (reason === 'low') return { label: 'Running Low', variant: 'secondary' as const };
    return null;
  };

  const activeItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed);

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-1">Shopping List</h1>
            <p className="text-muted-foreground">
              {activeItems.length} items to buy
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Collaboration indicator */}
        <Alert className="border-accent/50 bg-accent/5">
          <Users className="h-5 w-5 text-accent" />
          <AlertDescription className="ml-2">
            <span>Shared with 3 people</span>
            <span className="text-muted-foreground ml-2">• Sarah added milk 2h ago</span>
          </AlertDescription>
        </Alert>
      </div>

      {/* Active Items by Category */}
      <div className="space-y-6 mb-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const activeInCategory = categoryItems.filter(i => !i.completed);
          if (activeInCategory.length === 0) return null;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-3">
                <h2>{category}</h2>
                <span className="text-muted-foreground">
                  {activeInCategory.length}
                </span>
              </div>
              <Card>
                <div className="divide-y">
                  {activeInCategory.map((item) => {
                    const reasonBadge = getReasonBadge(item.reason);
                    return (
                      <div key={item.id} className="p-4 flex items-center gap-3">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleItem(item.id)}
                          id={`item-${item.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`item-${item.id}`}
                            className="cursor-pointer block mb-1"
                          >
                            {item.name}
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-muted-foreground">
                              ×{item.quantity}
                            </span>
                            {reasonBadge && (
                              <Badge variant={reasonBadge.variant} className="text-xs">
                                {reasonBadge.label}
                              </Badge>
                            )}
                            {item.priority === 'urgent' && (
                              <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-muted-foreground">Completed ({completedItems.length})</h2>
          <Card className="opacity-60">
            <div className="divide-y">
              {completedItems.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
                    id={`item-${item.id}`}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`item-${item.id}`}
                      className="cursor-pointer line-through text-muted-foreground"
                    >
                      {item.name} ×{item.quantity}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onAddItem}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
        aria-label="Add item to shopping list"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
