import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, indeterminate, checked, ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={indeterminate ? "indeterminate" : checked}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-neutral-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-neutral-50 data-[state=indeterminate]:bg-blue-600 data-[state=indeterminate]:text-neutral-50 dark:border-neutral-600 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 dark:data-[state=checked]:bg-blue-600 dark:data-[state=checked]:text-neutral-50 dark:data-[state=indeterminate]:bg-blue-600 dark:data-[state=indeterminate]:text-neutral-50",
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        {indeterminate ? <Minus className="h-3 w-3" /> : <Check className="h-4 w-4" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
