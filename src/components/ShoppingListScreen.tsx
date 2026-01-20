import { useState, useEffect } from "react";
import { Plus, Share2, SlidersHorizontal, Users, ShoppingCart } from "lucide-react";
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
  // Load items from localStorage - start empty for new users
  const loadItemsFromStorage = () => {
    const saved = localStorage.getItem('shopping_list_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading shopping list:', e);
      }
    }
    // Return empty array for new users
    return [];
  };

  const [items, setItems] = useState<ShoppingItem[]>(loadItemsFromStorage);

  // Save to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('shopping_list_items', JSON.stringify(items));
  }, [items]);

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

        {/* Collaboration indicator - only show if items exist */}
        {items.length > 0 && (
          <Alert className="border-accent/50 bg-accent/5">
            <Users className="h-5 w-5 text-accent" />
            <AlertDescription className="ml-2">
              <span>Your personal shopping list</span>
            </AlertDescription>
          </Alert>
        )}
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

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your list is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add items you need to buy
          </p>
          <Button onClick={onAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </Button>
        </div>
      )}

      {/* Floating Action Button */}
      {items.length > 0 && (
        <button
          onClick={onAddItem}
          className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
          aria-label="Add item to shopping list"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
