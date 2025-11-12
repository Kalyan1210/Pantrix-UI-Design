import { useState } from "react";
import { ArrowLeft, Camera, Upload, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";

interface ReceiptScanScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export function ReceiptScanScreen({ onBack, onComplete }: ReceiptScanScreenProps) {
  const [scanState, setScanState] = useState<'camera' | 'processing' | 'review'>('camera');
  const [progress, setProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState([
    { id: '1', name: 'Milk', checked: true },
    { id: '2', name: 'Eggs', checked: true },
    { id: '3', name: 'Bread', checked: true },
    { id: '4', name: 'Strawberries', checked: true },
    { id: '5', name: 'Yogurt', checked: true },
    { id: '6', name: 'Cheese', checked: true },
  ]);

  const handleCapture = () => {
    setScanState('processing');
    setProgress(0);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setScanState('review'), 300);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleConfirm = () => {
    onComplete();
  };

  const toggleItem = (id: string) => {
    setDetectedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  if (scanState === 'camera') {
    return (
      <div className="min-h-screen bg-black relative flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl text-white">Scan Receipt</h1>
          </div>
        </div>

        {/* Camera View */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Simulated camera background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          
          {/* Guide Overlay */}
          <div className="relative z-10 w-full max-w-sm mx-4">
            <div className="border-2 border-white/50 border-dashed rounded-2xl aspect-[3/4] flex items-center justify-center">
              <p className="text-white text-center px-6">
                Position receipt within frame
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent pb-safe">
          <div className="max-w-md mx-auto px-4 py-8 flex items-center justify-center gap-8">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              <Upload className="w-5 h-5" />
            </Button>
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
            >
              <div className="w-16 h-16 rounded-full border-4 border-black/20" />
            </button>
            <div className="w-12 h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (scanState === 'processing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl text-center mb-2">Processing Receipt</h2>
          <p className="text-muted-foreground text-center mb-8">
            Extracting items from your receipt...
          </p>
          <Progress value={progress} className="mb-4" />
          <p className="text-center text-muted-foreground">{progress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Review Items</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2>Items Detected</h2>
              <p className="text-muted-foreground">
                {detectedItems.filter(i => i.checked).length} of {detectedItems.length} items selected
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <div className="divide-y">
            {detectedItems.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-3">
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => toggleItem(item.id)}
                  id={`item-${item.id}`}
                />
                <label
                  htmlFor={`item-${item.id}`}
                  className="flex-1 cursor-pointer"
                >
                  {item.name}
                </label>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Button className="w-full" size="lg" onClick={handleConfirm}>
            Add {detectedItems.filter(i => i.checked).length} Items to Inventory
          </Button>
          <Button variant="outline" className="w-full" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
