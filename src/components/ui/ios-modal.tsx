import { useEffect, useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import { hapticLight } from '../../lib/haptics';

interface IOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  fullScreen?: boolean;
}

/**
 * iOS-style modal component with native-like slide-up animation
 * Similar to iOS presentation: 'modal' or 'pageSheet'
 */
export function IOSModal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  showCloseButton = true,
  fullScreen = false
}: IOSModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isAnimating ? 'bg-black/50' : 'bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* iOS-style modal container */}
      <div 
        className={`
          fixed inset-x-0 bottom-0 
          ${fullScreen ? 'top-0' : 'top-[5%]'}
          bg-card rounded-t-[20px] shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-y-0' : 'translate-y-full'}
          flex flex-col
          safe-area-bottom
        `}
      >
        {/* iOS drag indicator */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-3 border-b">
            <div className="w-10">
              {/* Spacer for centering */}
            </div>
            <h2 className="text-lg font-semibold flex-1 text-center">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * iOS-style action sheet that slides up from bottom
 */
interface IOSActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    destructive?: boolean;
    disabled?: boolean;
  }>;
  cancelLabel?: string;
}

export function IOSActionSheet({
  isOpen,
  onClose,
  title,
  message,
  actions,
  cancelLabel = 'Cancel'
}: IOSActionSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isAnimating ? 'bg-black/50' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`
          fixed inset-x-4 bottom-4
          transform transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-y-0' : 'translate-y-[120%]'}
          safe-area-bottom
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action buttons */}
        <div className="bg-card rounded-2xl overflow-hidden mb-2">
          {(title || message) && (
            <div className="px-4 py-3 text-center border-b">
              {title && <p className="font-semibold text-sm">{title}</p>}
              {message && <p className="text-muted-foreground text-sm mt-1">{message}</p>}
            </div>
          )}
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                hapticLight();
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={`
                w-full py-4 text-center text-lg border-t first:border-t-0
                transition-colors
                ${action.destructive 
                  ? 'text-destructive hover:bg-destructive/10' 
                  : 'text-primary hover:bg-primary/10'
                }
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <button
          onClick={handleClose}
          className="w-full py-4 bg-card rounded-2xl text-center text-lg font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
