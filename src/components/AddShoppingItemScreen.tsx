import { useState } from "react";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { addToShoppingList } from "../lib/shopping-list";
import { toast } from "sonner";
import { hapticSuccess } from "../lib/haptics";

interface AddShoppingItemScreenProps {
  onBack: () => void;
  onSave: () => void;
}

const categories = [
  'Produce',
  'Dairy',
  'Meat',
  'Seafood',
  'Bakery',
  'Frozen',
  'Pantry',
  'Beverages',
  'Snacks',
  'Condiments',
  'Other',
];

export function AddShoppingItemScreen({ onBack, onSave }: AddShoppingItemScreenProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("Other");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    setIsSubmitting(true);
    try {
      addToShoppingList({
        name: name.trim(),
        quantity,
        category,
        reason: 'manual',
      });
      
      hapticSuccess();
      toast.success(`${name} added to shopping list`);
      onSave();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Add to Shopping List</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {/* Item Name */}
        <Card className="p-4">
          <Label htmlFor="name" className="text-sm text-muted-foreground mb-2 block">
            Item Name
          </Label>
          <Input
            id="name"
            placeholder="e.g., Milk, Eggs, Bread..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg"
            autoFocus
          />
        </Card>

        {/* Quantity */}
        <Card className="p-4">
          <Label className="text-sm text-muted-foreground mb-3 block">
            Quantity
          </Label>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <span className="text-3xl font-medium min-w-[60px] text-center">{quantity}</span>
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

        {/* Category */}
        <Card className="p-4">
          <Label htmlFor="category" className="text-sm text-muted-foreground mb-2 block">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Submit Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim()}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add to Shopping List
        </Button>
      </div>
    </div>
  );
}
