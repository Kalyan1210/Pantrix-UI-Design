import { useState } from "react";
import { Search, Plus, Filter, Refrigerator, Package, Snowflake, Apple } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  daysUntilExpiry: number;
  location: 'fridge' | 'freezer' | 'pantry' | 'counter';
  icon: string;
}

interface InventoryScreenProps {
  onItemClick: (item: InventoryItem) => void;
  onAddItem: () => void;
}

export function InventoryScreen({ onItemClick, onAddItem }: InventoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const items: InventoryItem[] = [
    { id: '1', name: 'Milk', quantity: 1, daysUntilExpiry: 0, location: 'fridge', icon: '🥛' },
    { id: '2', name: 'Strawberries', quantity: 1, daysUntilExpiry: 1, location: 'fridge', icon: '🍓' },
    { id: '3', name: 'Yogurt', quantity: 3, daysUntilExpiry: 2, location: 'fridge', icon: '🥛' },
    { id: '4', name: 'Chicken Breast', quantity: 2, daysUntilExpiry: 3, location: 'fridge', icon: '🍗' },
    { id: '5', name: 'Cheese', quantity: 1, daysUntilExpiry: 7, location: 'fridge', icon: '🧀' },
    { id: '6', name: 'Lettuce', quantity: 1, daysUntilExpiry: 4, location: 'fridge', icon: '🥬' },
    { id: '7', name: 'Ice Cream', quantity: 2, daysUntilExpiry: 90, location: 'freezer', icon: '🍦' },
    { id: '8', name: 'Frozen Pizza', quantity: 3, daysUntilExpiry: 120, location: 'freezer', icon: '🍕' },
    { id: '9', name: 'Pasta', quantity: 2, daysUntilExpiry: 365, location: 'pantry', icon: '🍝' },
    { id: '10', name: 'Rice', quantity: 1, daysUntilExpiry: 400, location: 'pantry', icon: '🍚' },
    { id: '11', name: 'Canned Tomatoes', quantity: 4, daysUntilExpiry: 500, location: 'pantry', icon: '🥫' },
    { id: '12', name: 'Bananas', quantity: 6, daysUntilExpiry: 2, location: 'counter', icon: '🍌' },
    { id: '13', name: 'Apples', quantity: 5, daysUntilExpiry: 5, location: 'counter', icon: '🍎' },
  ];

  const getUrgencyBadge = (days: number) => {
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
      filtered = filtered.filter(item => item.daysUntilExpiry <= 5);
    } else if (activeFilter === 'low') {
      filtered = filtered.filter(item => item.quantity <= 2);
    }

    return filtered.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  const renderItemList = (items: InventoryItem[]) => (
    <div className="space-y-2">
      {items.map((item) => {
        const urgency = getUrgencyBadge(item.daysUntilExpiry);
        return (
          <Card
            key={item.id}
            className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onItemClick(item)}
          >
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="truncate">{item.name}</h3>
                <span className="text-muted-foreground">×{item.quantity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={urgency.variant} className={urgency.color}>
                  {urgency.label}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-4">Inventory</h1>
        
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
      <Tabs defaultValue="all" className="w-full">
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
