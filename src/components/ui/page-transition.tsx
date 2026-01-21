import { ReactNode, useEffect, useState } from 'react';
import { hapticLight } from '../../lib/haptics';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'bottom' | 'fade' | 'scale';
  className?: string;
  onEnter?: () => void;
}

/**
 * Page Transition Wrapper
 * Provides smooth animations when switching between screens
 */
export function PageTransition({ 
  children, 
  direction = 'right',
  className = '',
  onEnter 
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsVisible(true);
      hapticLight();
      onEnter?.();
    }, 10);

    return () => clearTimeout(timer);
  }, [onEnter]);

  const animationClass = {
    'right': 'animate-slide-in-right',
    'left': 'animate-slide-in-left',
    'bottom': 'animate-slide-in-bottom',
    'fade': 'animate-fade-in',
    'scale': 'animate-scale-in',
  }[direction];

  return (
    <div 
      className={`${animationClass} ${className}`}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {children}
    </div>
  );
}

/**
 * Staggered List Animation
 * Animates list items with a delay between each
 */
interface StaggeredListProps {
  children: ReactNode[];
  baseDelay?: number;
  className?: string;
}

export function StaggeredList({ 
  children, 
  baseDelay = 50,
  className = '' 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div 
          key={index}
          className="animate-slide-in-bottom"
          style={{ 
            animationDelay: `${index * baseDelay}ms`,
            opacity: 0,
            animationFillMode: 'forwards'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

