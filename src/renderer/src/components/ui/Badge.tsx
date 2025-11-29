import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex !uppercase items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium font-mono rounded-full border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
        success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
        error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700",
        warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
        info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
        active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700",
        inactive: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600",
        running: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700",
        pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
        stopped: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700",
        queued: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
      },
      size: {
        sm: "text-[9px] px-1.5 py-0.5",
        md: "text-[10px] px-2 py-0.5",
        lg: "text-[11px] px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon}
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

// Helper component for status badges with icons
interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: "SUCCESS" | "FAILURE" | "RUNNING" | "PENDING" | "STOPPED" | "QUEUED" | "active" | "inactive" | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children, ...props }) => {
  const getVariant = (): BadgeProps["variant"] => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
      case "ACTIVE":
        return "success";
      case "FAILURE":
      case "ERROR":
        return "error";
      case "RUNNING":
        return "running";
      case "PENDING":
        return "pending";
      case "QUEUED":
        return "queued";
      case "STOPPED":
        return "stopped";
      case "INACTIVE":
        return "inactive";
      default:
        return "default";
    }
  };

  const getIcon = () => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
      case "ACTIVE":
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        );
      case "FAILURE":
      case "ERROR":
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "RUNNING":
        return (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        );
      case "PENDING":
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "QUEUED":
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        );
      case "STOPPED":
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        );
      case "INACTIVE":
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Badge variant={getVariant()} icon={getIcon()} {...props}>
      {children || status}
    </Badge>
  );
};

export { Badge, StatusBadge, badgeVariants };
