import React, { useEffect, useState } from 'react';

interface AnimatedSplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

/**
 * Animated Splash Screen with 🥗 emoji
 * Features: Zoom in/out pulse + continuous spinning
 */
export function AnimatedSplashScreen({ 
  onComplete, 
  minDuration = 2000 
}: AnimatedSplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out
      }, minDuration);
      return () => clearTimeout(timer);
    }
  }, [onComplete, minDuration]);

  if (!isVisible && onComplete) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <style>{`
        /* Main emoji animation: zoom in/out while spinning */
        @keyframes zoomSpinPulse {
          0% {
            transform: scale(0.6) rotate(0deg);
            opacity: 0.7;
          }
          25% {
            transform: scale(1.1) rotate(90deg);
            opacity: 1;
          }
          50% {
            transform: scale(0.85) rotate(180deg);
            opacity: 0.9;
          }
          75% {
            transform: scale(1.05) rotate(270deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.6) rotate(360deg);
            opacity: 0.7;
          }
        }
        
        /* Continuous gentle spin with zoom breathing */
        @keyframes breatheSpin {
          0%, 100% {
            transform: scale(0.9) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(180deg);
          }
        }
        
        /* Glow pulse behind emoji */
        @keyframes glowPulse {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.6;
          }
        }
        
        /* Text fade in */
        @keyframes fadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Shimmer effect for text */
        @keyframes textShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .splash-emoji {
          font-size: 100px;
          animation: zoomSpinPulse 3s ease-in-out infinite;
          filter: drop-shadow(0 10px 30px rgba(76, 175, 80, 0.3));
          will-change: transform, opacity;
        }
        
        .splash-glow {
          position: absolute;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(76, 175, 80, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 3s ease-in-out infinite;
          will-change: transform, opacity;
        }
        
        .splash-title {
          animation: fadeSlideUp 0.5s ease-out 0.3s forwards;
          opacity: 0;
          background: linear-gradient(
            90deg, 
            hsl(var(--foreground)) 0%, 
            hsl(var(--primary)) 50%, 
            hsl(var(--foreground)) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .splash-title.shimmer {
          animation: fadeSlideUp 0.5s ease-out 0.3s forwards, textShimmer 2s linear 0.8s infinite;
        }
        
        .splash-subtitle {
          animation: fadeSlideUp 0.5s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        /* Floating dots */
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) scale(1.2);
            opacity: 1;
          }
        }
        
        .floating-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: hsl(var(--primary));
          border-radius: 50%;
          opacity: 0.6;
        }
        
        .floating-dot:nth-child(1) {
          top: 25%;
          left: 20%;
          animation: float 2s ease-in-out 0s infinite;
        }
        
        .floating-dot:nth-child(2) {
          top: 30%;
          right: 25%;
          animation: float 2.5s ease-in-out 0.3s infinite;
        }
        
        .floating-dot:nth-child(3) {
          bottom: 35%;
          left: 25%;
          animation: float 2.2s ease-in-out 0.6s infinite;
        }
        
        .floating-dot:nth-child(4) {
          bottom: 30%;
          right: 20%;
          animation: float 2.8s ease-in-out 0.9s infinite;
        }
      `}</style>
      
      {/* Floating background dots */}
      <div className="floating-dot" />
      <div className="floating-dot" />
      <div className="floating-dot" />
      <div className="floating-dot" />
      
      {/* Main content */}
      <div className="flex flex-col items-center">
        {/* Emoji with glow */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="splash-glow" />
          <div className="splash-emoji">🥗</div>
        </div>
        
        {/* App name */}
        <h1 className="text-4xl font-bold splash-title shimmer tracking-tight">
          Pantrix
        </h1>
        
        {/* Tagline */}
        <p className="text-muted-foreground mt-3 text-sm splash-subtitle">
          Your smart pantry companion
        </p>
      </div>
    </div>
  );
}
