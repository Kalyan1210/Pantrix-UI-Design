import { Button } from "./ui/button";
import { Leaf, Bell, Users, Camera } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center px-6 pb-24">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-primary shadow-xl flex items-center justify-center mb-6">
          <Leaf className="w-14 h-14 text-primary-foreground" />
        </div>
        
        <h1 className="text-4xl mb-3 text-center">Pantrix</h1>
        <p className="text-muted-foreground text-center mb-12 max-w-xs">
          Your smart grocery companion. Track inventory, prevent waste, and never forget what's in your pantry.
        </p>

        {/* Feature highlights */}
        <div className="space-y-4 mb-12 w-full">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3>Scan Receipts</h3>
              <p className="text-muted-foreground">Automatically add items by scanning your grocery receipts</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3>Spoilage Alerts</h3>
              <p className="text-muted-foreground">Get notified before food expires and reduce waste</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3>Shared Lists</h3>
              <p className="text-muted-foreground">Collaborate with family and roommates in real-time</p>
            </div>
          </div>
        </div>

        <Button onClick={onGetStarted} size="lg" className="w-full">
          Get Started
        </Button>
      </div>
    </div>
  );
}
