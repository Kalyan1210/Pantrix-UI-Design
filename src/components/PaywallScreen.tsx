/**
 * Paywall Screen
 * Premium subscription paywall for Pantrix Pro
 * Design inspired by Muse Coach
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';
import { toast } from 'sonner';
import { purchasePackage, restorePurchases, isRevenueCatConfigured } from '../lib/revenue-cat';

interface PaywallScreenProps {
  onClose: () => void;
}

type PlanType = 'monthly' | 'annual';

const BENEFITS = [
  'Personalized pantry insights',
  'Unlimited AI recipes',
  'Priority support',
  'Cancel anytime',
];

export function PaywallScreen({ onClose }: PaywallScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const plansRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  const handleSubscribe = async () => {
    hapticMedium();
    setIsLoading(true);
    
    if (!isRevenueCatConfigured()) {
      // Demo mode
      await new Promise(resolve => setTimeout(resolve, 1500));
      hapticSuccess();
      toast.success('Welcome to Pantrix Pro! (Demo)');
      setIsLoading(false);
      onClose();
      return;
    }

    // Real purchase
    const pkg = {
      identifier: selectedPlan === 'annual' ? 'pantrix_pro_annual' : 'pantrix_pro_monthly',
      packageType: selectedPlan === 'annual' ? 'ANNUAL' : 'MONTHLY',
    };
    
    const result = await purchasePackage(pkg);
    
    if (result.success) {
      hapticSuccess();
      toast.success('Welcome to Pantrix Pro!');
      onClose();
    } else if (result.error && result.error !== 'cancelled') {
      toast.error(result.error);
    }
    
    setIsLoading(false);
  };

  const handleRestore = async () => {
    hapticLight();
    setIsRestoring(true);
    
    const result = await restorePurchases();
    
    if (result.success && result.isPro) {
      hapticSuccess();
      toast.success('Pro subscription restored!');
      onClose();
    } else {
      toast.info('No previous purchases found');
    }
    
    setIsRestoring(false);
  };

  const getButtonText = () => {
    if (selectedPlan === 'annual') {
      return 'Subscribe for $49.99/year';
    }
    return 'Subscribe for $6.99/month';
  };

  const handleSeePlans = useCallback(() => {
    if (!scrollRef.current || !plansRef.current) return;
    const top = plansRef.current.offsetTop - 8;
    scrollRef.current.scrollTo({ top, behavior: 'smooth' });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-2 safe-area-top">
        <button
          onClick={() => {
            hapticLight();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSeePlans}
          className="text-violet-600 dark:text-violet-400 font-semibold text-base active:opacity-70 transition-opacity"
        >
          See plans
        </button>
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 overscroll-contain">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">✨🥗</div>
          <h1 className="text-2xl font-bold mb-1">Pantrix Pro</h1>
          <p className="text-muted-foreground">
            Unlock the full power of smart pantry management
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-6 space-y-3">
          {BENEFITS.map((b, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b border-border/60 pb-3">
              <span className="text-violet-600 dark:text-violet-400 font-semibold">✓</span>
              <span className="text-foreground font-medium">{b}</span>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div ref={plansRef} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h2 className="text-lg font-semibold">Choose a plan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                hapticLight();
                setSelectedPlan('monthly');
              }}
              className={`w-full p-4 rounded-2xl border transition-all active:scale-[0.99] ${
                selectedPlan === 'monthly'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-border bg-card'
              }`}
            >
              <p className="font-semibold text-left">Monthly</p>
              <p className="text-2xl font-bold text-left">$6.99</p>
              <p className="text-sm text-muted-foreground text-left">Billed monthly, cancel anytime</p>
            </button>
            <button
              onClick={() => {
                hapticLight();
                setSelectedPlan('annual');
              }}
              className={`w-full p-4 rounded-2xl border transition-all active:scale-[0.99] relative ${
                selectedPlan === 'annual'
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                  : 'border-border bg-card'
              }`}
            >
              <p className="font-semibold text-left">Yearly</p>
              <p className="text-2xl font-bold text-left">$49.99</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 text-left">Best value — save 40%</p>
              {selectedPlan === 'annual' && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mb-4">
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full h-14 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white font-semibold text-base flex items-center justify-center active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              getButtonText()
            )}
          </button>
        </div>

        {/* Restore + Terms */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
          <button
            onClick={handleRestore}
            disabled={isRestoring}
            className="font-semibold text-violet-600 dark:text-violet-400"
          >
            {isRestoring ? 'Restoring...' : 'Restore purchases'}
          </button>
          <span>•</span>
          <a className="font-semibold text-violet-600 dark:text-violet-400" href="https://yourapp.example.com/terms" target="_blank" rel="noreferrer">
            Terms
          </a>
          <span>•</span>
          <a className="font-semibold text-violet-600 dark:text-violet-400" href="https://yourapp.example.com/privacy" target="_blank" rel="noreferrer">
            Privacy
          </a>
        </div>

        {/* Fine Print */}
        <p className="text-center text-xs text-muted-foreground pb-6 safe-area-bottom">
          Cancel anytime. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
        </p>
      </div>
    </div>
  );
}
