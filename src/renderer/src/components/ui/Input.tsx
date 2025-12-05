import * as React from "react";
import { cn } from "../../utils/cn";

export type NumberFormatType = "IBAN" | "BIC" | "CreditCardNumber" | "UntilDate" | "CVV";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional formatting type for number/code inputs.
   * Formats the display value while keeping the actual value clean.
   * - IBAN: Groups of 4, uppercase (AT89 3704 0044 0532 0130 00)
   * - BIC: Groups of 4, uppercase (RLNW ATWW)
   * - CreditCardNumber: Groups of 4 (4242 4242 4242 4242)
   * - UntilDate: MM/YY format (12/30)
   * - CVV: 3-4 digits only
   */
  numberType?: NumberFormatType;
}

// Format value for display (with spaces/slashes)
const formatForDisplay = (value: string, type: NumberFormatType): string => {
  if (!value) return "";
  
  // Remove all non-alphanumeric characters first
  const clean = value.replace(/[^a-zA-Z0-9]/g, "");
  
  switch (type) {
    case "IBAN":
      // Groups of 4, uppercase, max 34 chars
      return clean
        .toUpperCase()
        .slice(0, 34)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    
    case "BIC":
      // Groups of 4, uppercase, max 11 chars
      return clean
        .toUpperCase()
        .slice(0, 11)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    
    case "CreditCardNumber":
      // Groups of 4, max 16 digits
      return clean
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
    
    case "UntilDate":
      // MM/YY format, max 4 digits
      const digits = clean.replace(/\D/g, "").slice(0, 4);
      if (digits.length <= 2) return digits;
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    
    case "CVV":
      // 3-4 digits only
      return clean.replace(/\D/g, "").slice(0, 4);
    
    default:
      return value;
  }
};

// Strip formatting to get clean value (for storage)
const stripFormatting = (value: string, type: NumberFormatType): string => {
  if (!value) return "";
  
  switch (type) {
    case "IBAN":
    case "BIC":
      // Remove spaces, keep uppercase
      return value.replace(/\s/g, "").toUpperCase();
    
    case "CreditCardNumber":
    case "CVV":
      // Remove spaces, keep only digits
      return value.replace(/\D/g, "");
    
    case "UntilDate":
      // Remove slash, keep only digits
      return value.replace(/\D/g, "");
    
    default:
      return value;
  }
};

// Get max length for each type (for the clean value)
const getMaxLength = (type: NumberFormatType): number => {
  switch (type) {
    case "IBAN": return 34;
    case "BIC": return 11;
    case "CreditCardNumber": return 16;
    case "UntilDate": return 4;
    case "CVV": return 4;
    default: return Infinity;
  }
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, numberType, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current!);
    
    // Sync display value when external value changes
    React.useEffect(() => {
      if (numberType && value !== undefined) {
        setDisplayValue(formatForDisplay(String(value), numberType));
      }
    }, [value, numberType]);
    
    // Handle input change with formatting
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!numberType) {
        // No formatting, pass through
        onChange?.(e);
        return;
      }
      
      const inputValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      
      // Get clean value
      const cleanValue = stripFormatting(inputValue, numberType);
      
      // Check max length
      const maxLen = getMaxLength(numberType);
      if (cleanValue.length > maxLen) {
        return; // Don't allow more input
      }
      
      // Format for display
      const formatted = formatForDisplay(cleanValue, numberType);
      setDisplayValue(formatted);
      
      // Create synthetic event with clean value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: cleanValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange?.(syntheticEvent);
      
      // Restore cursor position (accounting for added spaces)
      requestAnimationFrame(() => {
        if (inputRef.current) {
          // Calculate new cursor position
          const beforeCursor = inputValue.slice(0, cursorPos);
          const cleanBeforeCursor = stripFormatting(beforeCursor, numberType);
          const formattedBeforeCursor = formatForDisplay(cleanBeforeCursor, numberType);
          const newCursorPos = formattedBeforeCursor.length;
          
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    };
    
    // If numberType is set, use controlled display value
    const inputProps = numberType
      ? { value: displayValue, onChange: handleChange }
      : { value, onChange };
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 flex-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 dark:text-white",
          className
        )}
        ref={inputRef}
        {...inputProps}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, formatForDisplay, stripFormatting };
