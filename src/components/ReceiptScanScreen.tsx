import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Camera, Upload, Check, X, Plus, Minus, RotateCcw, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { parseReceipt, parseProduct, analyzeImage } from "../lib/anthropic";
import { analyzeImageViaProxy } from "../lib/anthropic-proxy";
import { addMultipleInventoryItems, addInventoryItem } from "../lib/inventory";
import { captureImageFromVideo, imageFileToBase64, requestCameraPermission } from "../lib/camera";
import { getCurrentUser } from "../lib/auth";
import { toast } from "sonner";

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ReceiptScanScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export function ReceiptScanScreen({ onBack, onComplete }: ReceiptScanScreenProps) {
  const [scanState, setScanState] = useState<'camera' | 'processing' | 'review'>('camera');
  const [progress, setProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState<ReceiptItem[]>([]);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanType, setScanType] = useState<'receipt' | 'product' | null>(null);
  const [productData, setProductData] = useState<{
    name: string;
    category: string;
    estimatedExpiry?: string;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera
  useEffect(() => {
    if (scanState === 'camera' && hasPermission === null) {
      initializeCamera();
    }

    return () => {
      // Cleanup camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [scanState, facingMode]);

  const initializeCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      setHasPermission(hasPermission);
      
      if (!hasPermission) {
        setCameraError('Camera permission denied. Please enable camera access in your browser settings.');
        return;
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraError(null);
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setCameraError('Failed to access camera. Please check your permissions.');
      setHasPermission(false);
    }
  };

  const flipCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    await initializeCamera();
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    try {
      const imageBase64 = await captureImageFromVideo(videoRef.current);
      setReceiptImage(`data:image/jpeg;base64,${imageBase64}`);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      setScanState('processing');
      await processReceipt(imageBase64);
    } catch (err) {
      console.error('Error capturing image:', err);
      toast.error('Failed to capture image. Please try again.');
    }
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const imageBase64 = await imageFileToBase64(file);
      setScanState('processing');
      await processReceipt(imageBase64);
    } catch (err) {
      console.error('Error processing image:', err);
      toast.error('Failed to process image. Please try again.');
    }
  };

  const processReceipt = async (imageBase64: string) => {
    setProgress(0);
    setIsLoading(true);
    setError(null);
    setScanType(null);
    setProductData(null);
    setDetectedItems([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Try proxy first, fallback to direct API
      let result;
      try {
        // Try proxy API (recommended for browser)
        result = await analyzeImageViaProxy(imageBase64);
      } catch (proxyError: any) {
        console.log('Proxy failed, trying direct API:', proxyError);
        // Fallback to direct API call
        result = await analyzeImage(imageBase64);
      }
      
      clearInterval(progressInterval);
      setProgress(100);

      if (result.type === 'receipt' && result.receiptData) {
        setScanType('receipt');
        // Transform to ReceiptItem format
        const items: ReceiptItem[] = result.receiptData.items.map((item, index) => ({
          id: `item-${index}-${Date.now()}`,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price || 0,
          category: item.category || 'other',
          confidence: item.confidence || 'medium',
        }));
        setDetectedItems(items);
      } else if (result.type === 'product' && result.productData) {
        setScanType('product');
        setProductData(result.productData);
        // Convert product to a single item for review - use quantity from API
        const item: ReceiptItem = {
          id: `product-${Date.now()}`,
          name: result.productData.name,
          quantity: result.productData.quantity || 1, // Use detected quantity
          price: 0,
          category: result.productData.category || 'other',
          confidence: result.productData.confidence || 'medium',
        };
        setDetectedItems([item]);
      }

      setTimeout(() => {
        setScanState('review');
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      console.error('Error analyzing image:', err);
      const errorMessage = err.message || 'Failed to analyze image. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
    }
  };

  const updateItem = (id: string, updates: Partial<ReceiptItem>) => {
    setDetectedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setDetectedItems(items => items.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setDetectedItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleConfirm = async () => {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Please sign in to add items to inventory.');
      return;
    }

    setIsLoading(true);
    try {
      if (scanType === 'product' && productData) {
        // Add single product
        await addInventoryItem(
          user.id,
          {
            name: productData.name,
            quantity: 1,
            category: productData.category,
            expiry_date: productData.estimatedExpiry,
          }
        );
        toast.success(`Successfully added ${productData.name} to inventory!`);
      } else {
        // Add multiple items from receipt
        const itemsToAdd = detectedItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          price: item.price,
        }));

        await addMultipleInventoryItems(user.id, itemsToAdd);
        toast.success(`Successfully added ${itemsToAdd.length} items to inventory!`);
      }
      onComplete();
    } catch (err: any) {
      console.error('Error adding items:', err);
      toast.error('Failed to add items to inventory. Please try again.');
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setScanState('camera');
    setDetectedItems([]);
    setReceiptImage(null);
    setError(null);
    setProgress(0);
    setScanType(null);
    setProductData(null);
    initializeCamera();
  };

  // Hidden file input ref for gallery
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera Screen - iOS Style
  if (scanState === 'camera') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col" style={{ zIndex: 9999 }}>
        {/* Top Bar */}
        <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-black/50">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-medium">PHOTO</span>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Camera Preview Area */}
        <div className="flex-1 relative bg-black">
          {hasPermission === false || cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
              <Camera className="w-20 h-20 mb-6 opacity-50" />
              <p className="text-center text-lg mb-2">Camera access needed</p>
              <p className="text-center text-sm text-white/60 mb-6">{cameraError || 'Please allow camera permission'}</p>
              <Button onClick={initializeCamera} className="bg-white text-black hover:bg-white/90">
                Enable Camera
              </Button>
            </div>
          ) : (
            <>
              {/* Live Camera Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Scan hint overlay */}
              <div className="absolute top-4 left-0 right-0 z-10 px-4">
                <div className="mx-auto bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                  <p className="text-white text-center text-sm">
                    📸 Point at receipt or product
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Controls - iOS Camera Style */}
        <div className="relative z-20 bg-black px-6 py-8 pb-10">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {/* Gallery Button - Shows thumbnail or icon */}
            <label className="cursor-pointer">
              <div className="w-14 h-14 rounded-xl bg-gray-800 border-2 border-white/30 flex items-center justify-center overflow-hidden hover:border-white/60 transition-colors">
                <ImageIcon className="w-7 h-7 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture={undefined}
                className="hidden"
                onChange={handleGallerySelect}
              />
            </label>

            {/* Shutter Button - Large White Circle */}
            <button
              onClick={handleCapture}
              disabled={hasPermission === false || !!cameraError}
              className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 0 0 4px rgba(255,255,255,0.3), 0 4px 20px rgba(0,0,0,0.4)'
              }}
            >
              <div className="w-[62px] h-[62px] rounded-full border-[3px] border-black/10" />
            </button>

            {/* Flip Camera Button */}
            <button
              onClick={flipCamera}
              disabled={hasPermission === false || !!cameraError}
              className="w-14 h-14 rounded-full bg-gray-800/80 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Mode indicator */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <span className="text-white/50 text-sm">VIDEO</span>
            <span className="text-yellow-400 font-medium text-sm">PHOTO</span>
            <span className="text-white/50 text-sm">SCAN</span>
          </div>
        </div>
      </div>
    );
  }

  // Processing Screen
  if (scanState === 'processing') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {receiptImage && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img src={receiptImage} alt="Receipt" className="w-full h-48 object-cover" />
            </div>
          )}
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-center mb-2">Analyzing Image</h2>
          <p className="text-muted-foreground text-center mb-8">
            Detecting and extracting information...
          </p>
          <Progress value={progress} className="mb-4" />
          <p className="text-center text-muted-foreground text-sm">{progress}%</p>
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm text-center mb-3 font-medium">{error}</p>
              <div className="flex gap-2">
                <Button 
                  onClick={retakePhoto} 
                  variant="outline" 
                  className="flex-1"
                >
                  Retake Photo
                </Button>
                <Button 
                  onClick={async () => {
                    if (receiptImage) {
                      // Extract base64 from data URL
                      const base64 = receiptImage.split(',')[1];
                      if (base64) {
                        setError(null);
                        setProgress(0);
                        setIsLoading(true);
                        await processReceipt(base64);
                      }
                    }
                  }}
                  className="flex-1"
                  disabled={!receiptImage}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Review Screen
  const selectedCount = detectedItems.length;
  const totalPrice = detectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasLowConfidence = detectedItems.some(item => item.confidence === 'low' || item.confidence === 'medium');

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={retakePhoto}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">Review Items</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Receipt Preview */}
        {receiptImage && (
          <div className="mb-4 rounded-lg overflow-hidden border">
            <img src={receiptImage} alt="Receipt" className="w-full h-32 object-cover" />
          </div>
        )}

        {/* Scan Type Badge */}
        {scanType && (
          <div className="mb-4">
            <Badge variant={scanType === 'receipt' ? 'default' : 'secondary'} className="text-sm">
              {scanType === 'receipt' ? '📄 Receipt Detected' : '📦 Product Detected'}
            </Badge>
          </div>
        )}

        {/* Product-specific info */}
        {scanType === 'product' && productData && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              {productData.estimatedExpiry && (
                <span>Expiry: {new Date(productData.estimatedExpiry).toLocaleDateString()}</span>
              )}
            </p>
          </div>
        )}

        {/* Confidence Banner */}
        {hasLowConfidence && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm text-center">
              Some items have low confidence. Please review and edit as needed.
            </p>
          </div>
        )}

        {/* Items List */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">
                {scanType === 'product' ? 'Product Detected' : 'Extracted Items'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {scanType === 'product' 
                  ? '1 item' 
                  : `${selectedCount} items • ${totalPrice > 0 ? `$${totalPrice.toFixed(2)} total` : ''}`
                }
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {detectedItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        className="flex-1 h-8 text-sm font-medium"
                      />
                      <Badge
                        variant={item.confidence === 'high' ? 'default' : item.confidence === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {item.confidence}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Category:</span>
                      <Input
                        value={item.category}
                        onChange={(e) => updateItem(item.id, { category: e.target.value })}
                        className="flex-1 h-7 text-xs"
                        placeholder="category"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Qty:</span>
                        <div className="flex items-center gap-1 border rounded-md">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="px-2 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Price:</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price.toFixed(2)}
                          onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                          className="w-20 h-7 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Items:</span>
            <span className="font-semibold">{selectedCount}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleConfirm}
            disabled={isLoading || selectedCount === 0}
          >
            {isLoading ? 'Adding to Inventory...' : `Add ${selectedCount} Items to Inventory`}
          </Button>
          <Button variant="outline" className="w-full" onClick={retakePhoto} disabled={isLoading}>
            Retake Photo
          </Button>
        </div>
      </div>
    </div>
  );
}
