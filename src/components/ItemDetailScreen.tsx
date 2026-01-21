import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, Calendar, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { useState } from "react";
import { InventoryItemUI } from "../lib/supabase";
import { getItemIcon } from "../lib/category-icons";
import { deleteInventoryItem, updateInventoryItem } from "../lib/inventory";
import { toast } from "sonner";

interface ItemDetailScreenProps {
  item: InventoryItemUI | null;
  onBack: () => void;
  onDelete: () => void;
  onAddToShoppingList: () => void;
}

export function ItemDetailScreen({ item, onBack, onDelete, onAddToShoppingList }: ItemDetailScreenProps) {
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [isDeleting, setIsDeleting] = useState(false);

  // If no item, show fallback
  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No item selected</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const itemIcon = getItemIcon(item.name, item.category);
  
  // Format dates for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get expiry badge
  const getExpiryBadge = () => {
    if (!item.daysUntilExpiry) return null;
    
    if (item.daysUntilExpiry <= 0) {
      return { label: 'Expired', className: 'bg-destructive/10 text-destructive border-destructive/20' };
    }
    if (item.daysUntilExpiry === 1) {
      return { label: 'Expires tomorrow', className: 'bg-secondary/10 text-secondary border-secondary/20' };
    }
    if (item.daysUntilExpiry <= 3) {
      return { label: `Expires in ${item.daysUntilExpiry} days`, className: 'bg-secondary/10 text-secondary border-secondary/20' };
    }
    return { label: `Expires in ${item.daysUntilExpiry} days`, className: 'bg-muted text-muted-foreground' };
  };

  const expiryBadge = getExpiryBadge();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteInventoryItem(item.id);
      toast.success(`${item.name} removed from inventory`);
      onDelete();
    } catch (error) {
      toast.error('Failed to delete item');
      setIsDeleting(false);
    }
  };

  const handleMarkAsUsed = async () => {
    setIsDeleting(true);
    try {
      await deleteInventoryItem(item.id);
      toast.success(`${item.name} marked as used`);
      onDelete();
    } catch (error) {
      toast.error('Failed to update item');
      setIsDeleting(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
    try {
      await updateInventoryItem(item.id, { quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Capitalize location
  const formatLocation = (loc: string) => {
    return loc.charAt(0).toUpperCase() + loc.slice(1);
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
            <span className="text-7xl">{itemIcon}</span>
          </div>
          <h2 className="text-2xl mb-2">{item.name}</h2>
          {expiryBadge && (
            <Badge variant="secondary" className={expiryBadge.className}>
              {expiryBadge.label}
            </Badge>
          )}
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
              onClick={() => handleQuantityChange(Math.max(0, quantity - 1))}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-3xl min-w-[60px] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => handleQuantityChange(quantity + 1)}
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
                <p>{formatLocation(item.location)}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-muted-foreground">Purchase Date</p>
                <p>{formatDate(item.purchase_date)}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-muted-foreground">Expiry Date</p>
                <p>{formatDate(item.expiry_date)}</p>
              </div>
            </div>
            {item.price && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 text-muted-foreground text-center">$</span>
                  <div className="flex-1">
                    <p className="text-muted-foreground">Price</p>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Category Badge */}
        {item.category && (
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="outline">{item.category}</Badge>
            </div>
          </Card>
        )}

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
            onClick={handleMarkAsUsed}
            disabled={isDeleting}
          >
            Mark as Used Up
          </Button>

          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10" 
            size="lg"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Item
          </Button>
        </div>
      </div>
    </div>
  );
}
