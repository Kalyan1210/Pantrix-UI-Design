import { ArrowLeft, Camera, Calendar, Plus, Minus, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { useState } from "react";
import { addInventoryItem } from "../lib/inventory";
import { getCurrentUser } from "../lib/auth";
import { toast } from "sonner";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "../lib/haptics";

interface AddItemScreenProps {
  onBack: () => void;
  onSave: () => void;
  onScanBarcode: () => void;
}

export function AddItemScreen({ onBack, onSave, onScanBarcode }: AddItemScreenProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("dairy");
  const [selectedLocation, setSelectedLocation] = useState<string>("fridge");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const locations = [
    { id: 'fridge', label: 'Fridge', icon: '❄️' },
    { id: 'freezer', label: 'Freezer', icon: '🧊' },
    { id: 'pantry', label: 'Pantry', icon: '📦' },
    { id: 'counter', label: 'Counter', icon: '🍎' },
  ];

  const categories = [
    'Dairy', 'Produce', 'Meat', 'Beverages', 'Snacks', 'Frozen', 'Bakery', 'Other'
  ];

  const adjustQuantity = (delta: number) => {
    hapticLight();
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error('Please sign in to add items.');
        return;
      }

      // Map category to lowercase for database
      const categoryLower = category.toLowerCase();

      await addInventoryItem(
        user.id,
        {
          name: itemName.trim(),
          quantity: quantity,
          category: categoryLower,
          location: selectedLocation as 'fridge' | 'freezer' | 'pantry' | 'counter',
          purchase_date: purchaseDate,
          expiry_date: expiryDate || undefined,
          price: price ? parseFloat(price) : undefined,
        }
      );

      hapticSuccess();
      toast.success('Item added to inventory!');
      onSave();
    } catch (error: any) {
      console.error('Error adding item:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to add item. Please try again.';
      
      if (error.message?.includes('user_id') || error.message?.includes('does not exist')) {
        errorMessage = 'Database error: Please run the SQL schema from supabase-schema.sql in your Supabase SQL Editor.';
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = 'Permission error: Please check your Supabase Row Level Security policies.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error: Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      hapticError();
      toast.error(errorMessage);
      console.error('Full error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b sticky top-0 z-10 safe-area-top">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="ios-press">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">Add Item</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-6 pb-32">
          {/* Scan Receipt Button */}
          <div className="mb-6">
            <button 
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 active:scale-[0.98] transition-transform"
              onClick={() => {
                hapticMedium();
                onScanBarcode();
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-primary">Capture Receipt or Product</h3>
                  <p className="text-muted-foreground text-sm">Auto-fill items from your photo</p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary" />
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                placeholder="e.g., Milk, Eggs, Bread"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="bg-input-background"
                required
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <div className="flex-1 h-12 bg-input-background rounded-lg border border-input flex items-center justify-center">
                  <span className="text-xl font-semibold">{quantity}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-full"
                  onClick={() => adjustQuantity(1)}
                  disabled={quantity >= 99}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="expiryDate"
                  type="date"
                  className="pl-10 bg-input-background"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label>Location</Label>
              <div className="grid grid-cols-2 gap-3">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setSelectedLocation(location.id);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 active:scale-95 ${
                      selectedLocation === location.id
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl">{location.icon}</div>
                    <p className={`text-sm font-medium ${selectedLocation === location.id ? 'text-primary' : 'text-muted-foreground'}`}>
                      {location.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label>Category</Label>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setCategory(cat);
                    }}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                      category === cat
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 border border-border text-muted-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (Optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-input-background"
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="purchaseDate"
                  type="date"
                  className="pl-10 bg-input-background"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Footer with Save Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t z-20 safe-area-bottom">
        <div className="max-w-md mx-auto px-4 py-4">
          <Button 
            type="submit" 
            className="w-full rounded-xl h-14 text-base font-semibold ios-press" 
            size="lg" 
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'Adding...' : 'Add to Inventory'}
          </Button>
        </div>
      </div>
    </div>
  );
}
