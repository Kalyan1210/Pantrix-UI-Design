import { useState, useEffect, useRef } from "react";
import { Plus, Share2, Users, ShoppingCart, X, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from "sonner";

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
  completedAt?: number;
}

// Swipeable item component
function SwipeableCompletedItem({ 
  item, 
  index, 
  totalItems,
  onUncheck, 
  onDelete,
  isExpanded 
}: { 
  item: ShoppingItem; 
  index: number;
  totalItems: number;
  onUncheck: () => void; 
  onDelete: () => void;
  isExpanded: boolean;
}) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    // Only allow swiping left (negative)
    if (diff < 0) {
      setOffset(Math.max(diff, -120));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offset < -80) {
      // Swipe threshold reached - delete
      setOffset(-300);
      setTimeout(() => onDelete(), 200);
    } else {
      setOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    currentX.current = e.clientX;
    const diff = currentX.current - startX.current;
    if (diff < 0) {
      setOffset(Math.max(diff, -120));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (offset < -80) {
      setOffset(-300);
      setTimeout(() => onDelete(), 200);
    } else {
      setOffset(0);
    }
  };

  // Stacked card effect - only show when collapsed
  const stackOffset = isExpanded ? 0 : Math.min(index, 3) * 4;
  const stackScale = isExpanded ? 1 : 1 - (Math.min(index, 3) * 0.02);
  const stackOpacity = isExpanded ? 1 : index > 3 ? 0 : 1 - (index * 0.15);
  const isHidden = !isExpanded && index > 3;

  if (isHidden) return null;

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        marginTop: isExpanded ? (index === 0 ? 0 : 8) : (index === 0 ? 0 : -52),
        zIndex: totalItems - index,
        opacity: stackOpacity,
        transform: `scale(${stackScale})`,
        transition: isDragging ? 'none' : 'all 0.3s ease-out',
      }}
    >
      {/* Delete background */}
      <div 
        className="absolute inset-y-0 right-0 bg-destructive flex items-center justify-end px-4 rounded-lg"
        style={{ width: '120px' }}
      >
        <Trash2 className="w-5 h-5 text-white" />
      </div>

      {/* Swipeable card */}
      <div
        className="relative bg-card border rounded-lg p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Checkbox
          checked={true}
          onCheckedChange={onUncheck}
          className="data-[state=checked]:bg-primary/50"
        />
        <span className="flex-1 line-through text-muted-foreground text-sm">
          {item.name} ×{item.quantity}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-muted rounded-full opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ShoppingListScreen({ onAddItem }: ShoppingListScreenProps) {
  const loadItemsFromStorage = () => {
    const saved = localStorage.getItem('shopping_list_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading shopping list:', e);
      }
    }
    return [];
  };

  const [items, setItems] = useState<ShoppingItem[]>(loadItemsFromStorage);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem('shopping_list_items', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? Date.now() : undefined } 
        : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const clearAllCompleted = () => {
    setItems(items.filter(item => !item.completed));
    toast.success('Cleared all completed items');
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
  const completedItems = items
    .filter(i => i.completed)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)); // Most recent first

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Shopping List</h1>
            <p className="text-muted-foreground">
              {activeItems.length} items to buy
            </p>
          </div>
          <Button variant="outline" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

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
                <h2 className="font-semibold">{category}</h2>
                <span className="text-muted-foreground text-sm">
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
                            className="cursor-pointer block mb-1 font-medium"
                          >
                            {item.name}
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-muted-foreground text-sm">
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

      {/* Completed Items - Stacked notification style */}
      {completedItems.length > 0 && (
        <div className="mb-6">
          {/* Header with expand/collapse */}
          <button
            onClick={() => setCompletedExpanded(!completedExpanded)}
            className="w-full flex items-center justify-between mb-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Completed</span>
              <Badge variant="secondary" className="text-xs">
                {completedItems.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {completedItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllCompleted();
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear all
                </button>
              )}
              {completedExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Stacked cards */}
          <div className="relative">
            {!completedExpanded && completedItems.length > 1 && (
              <p className="text-xs text-muted-foreground mb-2 text-center">
                ← Swipe to remove • Tap to expand
              </p>
            )}
            
            <div 
              className={completedExpanded ? 'space-y-2' : 'relative'}
              style={{ 
                minHeight: completedExpanded ? 'auto' : `${Math.min(completedItems.length, 4) * 56}px`,
                paddingBottom: completedExpanded ? 0 : (Math.min(completedItems.length - 1, 3) * 4),
              }}
            >
              {completedItems.map((item, index) => (
                <SwipeableCompletedItem
                  key={item.id}
                  item={item}
                  index={index}
                  totalItems={completedItems.length}
                  onUncheck={() => toggleItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  isExpanded={completedExpanded}
                />
              ))}
            </div>
          </div>
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

      {/* All items completed state */}
      {items.length > 0 && activeItems.length === 0 && (
        <div className="text-center py-8 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🎉</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">All done!</h3>
          <p className="text-muted-foreground text-sm">
            You've completed your shopping list
          </p>
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
