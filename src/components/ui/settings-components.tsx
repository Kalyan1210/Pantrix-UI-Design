import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from './card';
import { Switch } from './switch';

/**
 * Reusable Settings UI Components
 * Clean, iOS-style settings patterns with dark mode support
 */

// ============================================
// SETTINGS SECTION
// ============================================

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  delay?: string;
  className?: string;
}

/**
 * A section container with a title header and grouped card content
 */
export function SettingsSection({ 
  title, 
  children, 
  delay = '0s',
  className = ''
}: SettingsSectionProps) {
  return (
    <div 
      className={`mb-6 animate-slide-in-bottom ${className}`} 
      style={{ animationDelay: delay }}
    >
      <h3 className="mb-3 text-muted-foreground text-sm font-medium uppercase tracking-wide">
        {title}
      </h3>
      <Card className="divide-y rounded-2xl overflow-hidden">
        {children}
      </Card>
    </div>
  );
}

// ============================================
// SETTINGS ROW (Clickable with Chevron)
// ============================================

type IconColorVariant = 
  | 'primary' 
  | 'teal' 
  | 'blue' 
  | 'orange' 
  | 'purple' 
  | 'red' 
  | 'amber'
  | 'muted';

interface SettingsRowProps {
  icon: React.ReactNode;
  iconColor?: IconColorVariant;
  label: string;
  description?: string;
  onClick: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  className?: string;
}

const iconColorClasses: Record<IconColorVariant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary/10', text: 'text-primary' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  muted: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

/**
 * A clickable settings row with icon, label, optional description, and chevron
 */
export function SettingsRow({
  icon,
  iconColor = 'muted',
  label,
  description,
  onClick,
  rightElement,
  showChevron = true,
  className = '',
}: SettingsRowProps) {
  const colorClasses = iconColorClasses[iconColor];

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors touch-feedback ${className}`}
    >
      <div className={`w-10 h-10 rounded-full ${colorClasses.bg} flex items-center justify-center`}>
        <span className={colorClasses.text}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        </span>
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {rightElement}
      {showChevron && (
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );
}

// ============================================
// SETTINGS SWITCH ROW
// ============================================

interface SettingsSwitchRowProps {
  icon: React.ReactNode;
  iconColor?: IconColorVariant;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A settings row with a toggle switch instead of chevron
 */
export function SettingsSwitchRow({
  icon,
  iconColor = 'muted',
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: SettingsSwitchRowProps) {
  const colorClasses = iconColorClasses[iconColor];

  return (
    <div className={`p-4 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${colorClasses.bg} flex items-center justify-center`}>
          <span className={colorClasses.text}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
          </span>
        </div>
        <div>
          <p className="font-medium">{label}</p>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

// ============================================
// SETTINGS ROW WITHOUT ICON CONTAINER
// ============================================

interface SimpleSettingsRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  className?: string;
}

/**
 * A simpler settings row with just an icon (no colored container)
 */
export function SimpleSettingsRow({
  icon,
  label,
  description,
  onClick,
  rightElement,
  showChevron = true,
  className = '',
}: SimpleSettingsRowProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 ${onClick ? 'hover:bg-muted/50 transition-colors touch-feedback' : ''} ${className}`}
    >
      <span className="text-muted-foreground">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </span>
      <div className="flex-1 text-left">
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {rightElement}
      {showChevron && onClick && (
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      )}
    </Component>
  );
}

// ============================================
// SIMPLE SWITCH ROW (without icon container)
// ============================================

interface SimpleSettingsSwitchRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A simpler switch row with just an icon (no colored container)
 */
export function SimpleSettingsSwitchRow({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
}: SimpleSettingsSwitchRowProps) {
  return (
    <div className={`p-4 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground">
          {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        </span>
        <div>
          <p className="font-medium">{label}</p>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
