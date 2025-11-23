import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

/**
 * Get Lucide icon component from icon name string
 */
export const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return LucideIcons.FileText;
  
  const IconComponent = (LucideIcons as any)[iconName];
  
  if (typeof IconComponent === 'function') {
    return IconComponent as LucideIcon;
  }
  
  return LucideIcons.FileText; // Fallback
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
  return Object.keys(LucideIcons).filter(
    key => typeof (LucideIcons as any)[key] === 'function' && key !== 'createLucideIcon'
  ).sort();
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
