import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Calendar, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { useState } from "react";

interface ItemDetailScreenProps {
  onBack: () => void;
  onDelete: () => void;
  onAddToShoppingList: () => void;
}

export function ItemDetailScreen({ onBack, onDelete, onAddToShoppingList }: ItemDetailScreenProps) {
  const [quantity, setQuantity] = useState(1);

  const item = {
    name: 'Strawberries',
    icon: '🍓',
    quantity: 1,
    daysUntilExpiry: 1,
    location: 'Fridge',
    purchaseDate: 'Nov 8, 2025',
    expiryDate: 'Nov 11, 2025',
    pattern: 'You usually buy this every 7 days',
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Item Details</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Item Image/Icon */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
            <span className="text-7xl">{item.icon}</span>
          </div>
          <h2 className="text-2xl mb-2">{item.name}</h2>
          <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
            Expires in {item.daysUntilExpiry} day
          </Badge>
        </div>

        {/* Quantity Control */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Quantity</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setQuantity(Math.max(0, quantity - 1))}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-3xl min-w-[60px] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Details */}
        <Card className="p-4 mb-4">
          <h3 className="mb-3">Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-muted-foreground">Storage Location</p>
                <p>{item.location}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-muted-foreground">Purchase Date</p>
                <p>{item.purchaseDate}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-muted-foreground">Expiry Date</p>
                <p>{item.expiryDate}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Consumption Pattern */}
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="mb-1">Consumption Insight</h3>
              <p className="text-muted-foreground">{item.pattern}</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            size="lg"
            onClick={onAddToShoppingList}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Shopping List
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            Mark as Used Up
          </Button>

          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10" 
            size="lg"
            onClick={onDelete}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Item
          </Button>
        </div>
      </div>
    </div>
  );
}
