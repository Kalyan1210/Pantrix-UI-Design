import { useState, useEffect } from "react";
import { Search, Plus, Filter, Refrigerator, Package, Snowflake, Apple, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { getInventoryItems, calculateDaysUntilExpiry, deleteInventoryItem } from "../lib/inventory";
import { getCurrentUser } from "../lib/auth";
import { InventoryItemUI } from "../lib/supabase";
import { toast } from "sonner";

interface InventoryScreenProps {
  onItemClick: (item: InventoryItemUI) => void;
  onAddItem: () => void;
  initialFilter?: string;
}

export function InventoryScreen({ onItemClick, onAddItem, initialFilter }: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter || "all");
  const [items, setItems] = useState<InventoryItemUI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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

  const filterItems = (items: InventoryItem[], location?: string) => {
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

    return filtered.sort((a, b) => {
      const daysA = calculateDaysUntilExpiry(a.expiry_date) ?? Infinity;
      const daysB = calculateDaysUntilExpiry(b.expiry_date) ?? Infinity;
      return daysA - daysB;
    });
  };

  const renderItemList = (items: InventoryItem[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item) => {
          const daysUntilExpiry = calculateDaysUntilExpiry(item.expiry_date);
          const urgency = getUrgencyBadge(daysUntilExpiry);
          const LocationIcon = locationIcons[item.location];
          
          return (
            <Card
              key={item.id}
              className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onItemClick(item)}
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {LocationIcon && <LocationIcon className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="truncate font-medium">{item.name}</h3>
                  <span className="text-muted-foreground text-sm">×{item.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
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
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Inventory</h1>
        
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
            onClick={() => setActiveFilter('all')}
          >
            All Items
          </Button>
          <Button
            variant={activeFilter === 'expiring' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('expiring')}
          >
            Expiring Soon
          </Button>
          <Button
            variant={activeFilter === 'low' ? 'outline' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('low')}
          >
            Running Low
          </Button>
        </div>
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

      {/* Floating Action Button */}
      <button
        onClick={onAddItem}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
        aria-label="Add item"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
