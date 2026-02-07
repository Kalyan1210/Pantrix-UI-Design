import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { updateUserPreferences } from '../lib/preferences';
import { IOSModal } from './ui/ios-modal';

interface SpoilageAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentDays: number;
  onUpdated: (days: number) => void;
}

export function SpoilageAlertModal({
  isOpen,
  onClose,
  userId,
  currentDays,
  onUpdated,
}: SpoilageAlertModalProps) {
  const [days, setDays] = useState(currentDays);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences(userId, {
        spoilage_alert_advance_days: days,
      });

      toast.success('Alert settings updated');
      onUpdated(days);
      onClose();
    } catch (error) {
      console.error('Error saving alert settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const options = [
    { value: 1, label: '1 day before' },
    { value: 2, label: '2 days before' },
    { value: 3, label: '3 days before' },
    { value: 5, label: '5 days before' },
    { value: 7, label: '1 week before' },
  ];

  return (
    <IOSModal isOpen={isOpen} onClose={onClose} title="Spoilage Alert Settings">
      <div className="px-4 py-4">
        {/* Description */}
        <p className="text-muted-foreground mb-6">
          Get notified before items in your inventory are about to expire
        </p>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setDays(option.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                days === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {days === option.value && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </IOSModal>
  );
}
