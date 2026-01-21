import { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, Refrigerator, Package, Snowflake, Apple, Loader2, ArrowUpDown, ShoppingCart, Trash2, ChevronRight } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { getInventoryItems, calculateDaysUntilExpiry, deleteInventoryItem } from "../lib/inventory";
import { getCurrentUser } from "../lib/auth";
import { InventoryItemUI } from "../lib/supabase";
import { toast } from "sonner";
import { getItemIcon } from "../lib/category-icons";
import { hapticLight, hapticMedium, hapticHeavy, hapticSuccess } from "../lib/haptics";
import { ListSkeleton } from "./ui/skeleton-loader";

interface InventoryScreenProps {
  onItemClick: (item: InventoryItemUI) => void;
  onAddItem: () => void;
  initialFilter?: string;
}

type SortOption = 'expiry' | 'name' | 'date' | 'category';

export function InventoryScreen({ onItemClick, onAddItem, initialFilter }: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter || "all");
  const [items, setItems] = useState<InventoryItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>('expiry');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [swipedItem, setSwipedItem] = useState<string | null>(null);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        toast.error('Please sign in to view inventory.');
        return;
      }

      const inventoryItems = await getInventoryItems(user.id);
      setItems(inventoryItems);
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyBadge = (days: number | null) => {
    if (days === null) return { label: 'No expiry', variant: 'outline' as const, color: 'bg-muted text-muted-foreground' };
    if (days <= 0) return { label: 'Expired', variant: 'destructive' as const, color: 'bg-destructive/10 text-destructive border-destructive/20' };
    if (days === 1) return { label: `${days} day`, variant: 'secondary' as const, color: 'bg-secondary/10 text-secondary border-secondary/20' };
    if (days <= 2) return { label: `${days} days`, variant: 'secondary' as const, color: 'bg-secondary/10 text-secondary border-secondary/20' };
    if (days <= 5) return { label: `${days} days`, variant: 'outline' as const, color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20' };
    return { label: `${days} days`, variant: 'outline' as const, color: 'bg-muted text-muted-foreground' };
  };

  const locationIcons = {
    fridge: Refrigerator,
    freezer: Snowflake,
    pantry: Package,
    counter: Apple,
  };

  const filterItems = (items: InventoryItemUI[], location?: string) => {
    let filtered = items;
    
    if (location) {
      filtered = filtered.filter(item => item.location === location);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter === 'expiring') {
      filtered = filtered.filter(item => {
        const days = calculateDaysUntilExpiry(item.expiry_date);
        return days !== null && days <= 5;
      });
    } else if (activeFilter === 'low') {
      filtered = filtered.filter(item => item.quantity <= 2);
    }

    // Sort based on selected option
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'expiry':
          const daysA = calculateDaysUntilExpiry(a.expiry_date) ?? Infinity;
          const daysB = calculateDaysUntilExpiry(b.expiry_date) ?? Infinity;
          return daysA - daysB;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.purchase_date || 0).getTime() - new Date(a.purchase_date || 0).getTime();
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });
  };

  // Handle swipe for delete/add to shopping list
  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipedItem(itemId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = async (item: InventoryItemUI) => {
    const diff = touchStartX.current - touchCurrentX.current;
    
    if (diff > 80) {
      // Swiped left - delete
      hapticHeavy();
      try {
        await deleteInventoryItem(item.id!);
        setItems(prev => prev.filter(i => i.id !== item.id));
        toast.success(`${item.name} deleted`);
      } catch (error) {
        toast.error('Failed to delete item');
      }
    } else if (diff < -80) {
      // Swiped right - add to shopping list
      hapticSuccess();
      const existingList = JSON.parse(localStorage.getItem('shopping_list_items') || '[]');
      const newItem = {
        id: Date.now().toString(),
        name: item.name,
        quantity: '1',
        completed: false,
        addedAt: new Date().toISOString()
      };
      localStorage.setItem('shopping_list_items', JSON.stringify([...existingList, newItem]));
      toast.success(`${item.name} added to shopping list`);
    }
    
    setSwipedItem(null);
    touchStartX.current = 0;
    touchCurrentX.current = 0;
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'expiry', label: 'Expiry Date' },
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date Added' },
    { value: 'category', label: 'Category' },
  ];

  const renderItemList = (filteredItems: InventoryItemUI[]) => {
    if (isLoading) {
      return <ListSkeleton count={5} />;
    }

    if (filteredItems.length === 0) {
      return (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No items found</p>
          <Button size="sm" onClick={() => { hapticMedium(); onAddItem(); }}>
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredItems.map((item, index) => {
          const daysUntilExpiry = calculateDaysUntilExpiry(item.expiry_date);
          const urgency = getUrgencyBadge(daysUntilExpiry);
          const itemIcon = getItemIcon(item.name, item.category);
          const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
          
          return (
            <div 
              key={item.id}
              className={`relative overflow-hidden animate-slide-in-bottom stagger-${Math.min(index + 1, 8)}`}
              style={{ animationFillMode: 'forwards', opacity: 0 }}
            >
              {/* Swipe action backgrounds */}
              <div className="absolute inset-0 flex">
                <div className="w-1/2 bg-primary/20 flex items-center pl-4">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <span className="ml-2 text-sm text-primary font-medium">Add to list</span>
                </div>
                <div className="w-1/2 bg-destructive/20 flex items-center justify-end pr-4">
                  <span className="mr-2 text-sm text-destructive font-medium">Delete</span>
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
              </div>
              
              {/* Main card */}
              <Card
                className={`p-4 flex items-center gap-3 transition-all cursor-pointer relative bg-card ${
                  isExpired ? 'border-destructive/30' : ''
                }`}
                style={{
                  transform: swipedItem === item.id ? `translateX(${touchStartX.current - touchCurrentX.current > 0 ? -Math.min(touchStartX.current - touchCurrentX.current, 100) : Math.min(touchCurrentX.current - touchStartX.current, 100)}px)` : 'translateX(0)',
                  transition: swipedItem === item.id ? 'none' : 'transform 0.3s ease'
                }}
                onClick={() => {
                  hapticLight();
                  onItemClick(item);
                }}
                onTouchStart={(e) => handleTouchStart(e, item.id!)}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(item)}
              >
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ${isExpired ? 'opacity-60' : ''}`}>
                  <span className="text-2xl">{itemIcon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`truncate font-medium ${isExpired ? 'line-through text-muted-foreground' : ''}`}>{item.name}</h3>
                    <span className="text-muted-foreground text-sm">×{item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={urgency.variant} className={urgency.color}>
                      {urgency.label}
                    </Badge>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto safe-area-top ios-scroll">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Inventory</h1>
          {/* Sort button */}
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              className="touch-feedback"
              onClick={() => {
                hapticLight();
                setShowSortMenu(!showSortMenu);
              }}
            >
              <ArrowUpDown className="w-4 h-4 mr-1" />
              Sort
            </Button>
            
            {/* Sort dropdown */}
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-card border rounded-lg shadow-lg z-50 animate-scale-in overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                      sortBy === option.value ? 'bg-primary/10 text-primary font-medium' : ''
                    }`}
                    onClick={() => {
                      hapticLight();
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input-background"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="touch-feedback"
            onClick={() => {
              hapticLight();
              setActiveFilter('all');
            }}
          >
            All Items
          </Button>
          <Button
            variant={activeFilter === 'expiring' ? 'secondary' : 'outline'}
            size="sm"
            className="touch-feedback"
            onClick={() => {
              hapticLight();
              setActiveFilter('expiring');
            }}
          >
            Expiring Soon
          </Button>
          <Button
            variant={activeFilter === 'low' ? 'secondary' : 'outline'}
            size="sm"
            className="touch-feedback"
            onClick={() => {
              hapticLight();
              setActiveFilter('low');
            }}
          >
            Running Low
          </Button>
        </div>
        
        {/* Swipe hint - show only on first visit */}
        {items.length > 0 && !localStorage.getItem('swipe_hint_shown') && (
          <p className="text-xs text-muted-foreground mt-2 text-center animate-fade-in">
            💡 Swipe left to delete, right to add to shopping list
          </p>
        )}
      </div>

      {/* Storage Location Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="fridge">
            <Refrigerator className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="freezer">
            <Snowflake className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="pantry">
            <Package className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="counter">
            <Apple className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {renderItemList(filterItems(items))}
        </TabsContent>
        <TabsContent value="fridge" className="mt-0">
          {renderItemList(filterItems(items, 'fridge'))}
        </TabsContent>
        <TabsContent value="freezer" className="mt-0">
          {renderItemList(filterItems(items, 'freezer'))}
        </TabsContent>
        <TabsContent value="pantry" className="mt-0">
          {renderItemList(filterItems(items, 'pantry'))}
        </TabsContent>
        <TabsContent value="counter" className="mt-0">
          {renderItemList(filterItems(items, 'counter'))}
        </TabsContent>
      </Tabs>

      {/* Click outside to close sort menu */}
      {showSortMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSortMenu(false)}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => {
          hapticMedium();
          localStorage.setItem('swipe_hint_shown', 'true');
          onAddItem();
        }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40 animate-pulse-glow"
        aria-label="Add item"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
