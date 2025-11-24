import React from 'react';
import { icons, LucideIcon } from 'lucide-react';

/**
 * Get Lucide icon component from icon name string
 */
export const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName || !(icons as any)[iconName]) return icons.FileText;
  
  return (icons as any)[iconName] as LucideIcon;
};

/**
 * Render Lucide icon from string name
 */
export const renderIcon = (
  iconName?: string, 
  size: number = 16, 
  className?: string
): React.ReactElement => {
  const Icon = getIconComponent(iconName);
  return <Icon size={size} className={className} />;
};

/**
 * Get all available Lucide icon names
 */
export const getAllIconNames = (): string[] => {
  return Object.keys(icons).sort();
};

/**
 * Get default icon for payment method type
 */
export const getDefaultPaymentIcon = (type: string): string => {
  switch(type) {
    case 'paypal': return 'CreditCard';
    case 'sepa': return 'Building2';
    case 'creditcard': return 'CreditCard';
    case 'eps': return 'Landmark';
    default: return 'CreditCard';
  }
};

/**
 * Get default icon for schedule based on cron expression
 */
export const getDefaultScheduleIcon = (cronExpression?: string): string => {
  if (!cronExpression) return 'Play';
  
  // Parse common cron patterns - order matters for specificity
  if (cronExpression.includes('9 * * *')) return 'Sun'; // Morning
  if (cronExpression.includes('12 * * *')) return 'Sun'; // Noon
  if (cronExpression.includes('18 * * *')) return 'Moon'; // Evening
  if (cronExpression.includes('* * 1')) return 'Calendar'; // Weekly
  if (cronExpression.includes('* * *')) return 'Clock'; // Hourly
  if (cronExpression.includes('0 0 ')) return 'Clock'; // Daily
  
  return 'Play'; // Default
};
