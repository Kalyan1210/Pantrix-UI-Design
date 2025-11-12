import { ArrowLeft, Camera, Calendar, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { useState } from "react";

interface AddItemScreenProps {
  onBack: () => void;
  onSave: () => void;
  onScanBarcode: () => void;
}

export function AddItemScreen({ onBack, onSave, onScanBarcode }: AddItemScreenProps) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedLocation, setSelectedLocation] = useState<string>("fridge");

  const locations = [
    { id: 'fridge', label: 'Fridge', icon: '❄️' },
    { id: 'freezer', label: 'Freezer', icon: '🧊' },
    { id: 'pantry', label: 'Pantry', icon: '📦' },
    { id: 'counter', label: 'Counter', icon: '🍎' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Add Item</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Scan Barcode Option */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">Quick Add</h3>
              <p className="text-muted-foreground">Scan barcode to auto-fill details</p>
            </div>
            <Button onClick={onScanBarcode}>Scan</Button>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name</Label>
            <Input
              id="itemName"
              placeholder="e.g. Milk, Eggs, Bananas"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="bg-input-background"
              required
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-input-background"
              required
            />
          </div>

          {/* Storage Location */}
          <div className="space-y-2">
            <Label>Storage Location</Label>
            <div className="grid grid-cols-2 gap-3">
              {locations.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setSelectedLocation(location.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedLocation === location.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{location.icon}</div>
                  <p className={selectedLocation === location.id ? 'text-primary' : ''}>
                    {location.label}
                  </p>
                </button>
              ))}
            </div>
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
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="expiryDate"
                type="date"
                className="pl-10 bg-input-background"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button type="submit" className="w-full" size="lg">
              Add to Inventory
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
