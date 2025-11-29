import React from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
  condensed?: boolean;
  to?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className = "", variant = "primary", size = "md", isLoading = false, disabled, children, condensed, to, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-start rounded-[0.25em] transition-colors focus:ring-0 focus:oultine-2 outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "font-[700] text-white bg-blue-600 dark:bg-blue-700 border border-1 dark:border-blue-700 border-blue-800 hover:bg-blue-700",
    secondary: "font-[500] text-gray-800 dark:text-gray-200 bg-gray-50 border-1 dark:border-gray-600 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600",
    outline: "font-[500] text-blue-600 dark:text-blue-400 bg-transparent border-1 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    ghost: "font-[500] text-gray-700 dark:text-gray-300 bg-transparent border-1 border-transparent",
    danger: "font-[700] text-white bg-red-600 dark:bg-red-700 border border-1 dark:border-red-800 border-red-700 hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3.5 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];
  const condensedClasses = condensed ? "condensed" : null;

  if (to) {
    return (
      <Link
        ref={ref}
        style={{ fontStretch: "115%" }}
        className={`${baseClasses} ${condensedClasses} ${variantClasses} ${sizeClasses} ${className}`}
        // disabled={disabled || isLoading}
        {...(props as any)}
        to={to}>
        {isLoading && (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          </>
        )}
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      style={{ fontStretch: "115%" }}
      className={`${baseClasses} ${condensedClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}>
      {isLoading && (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        </>
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
