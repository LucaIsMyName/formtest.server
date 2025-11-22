# Button Component Usage Guide

## Import
```tsx
import Button from '../components/Button'
```

## Basic Usage
```tsx
<Button onClick={handleClick}>
  Click me
</Button>
```

## Variants
```tsx
{/* Primary (default) - Blue background */}
<Button variant="primary">Primary Button</Button>

{/* Secondary - Gray background */}
<Button variant="secondary">Secondary Button</Button>

{/* Outline - Transparent with blue border */}
<Button variant="outline">Outline Button</Button>

{/* Ghost - Transparent with no border */}
<Button variant="ghost">Ghost Button</Button>
```

## Sizes
```tsx
{/* Small - px-2.5 py-1 text-xs */}
<Button size="sm">Small</Button>

{/* Medium (default) - px-3 py-1.5 text-sm */}
<Button size="md">Medium</Button>

{/* Large - px-4 py-2 text-base */}
<Button size="lg">Large</Button>
```

## Loading State
```tsx
<Button isLoading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

## Disabled State
```tsx
<Button disabled={!isValid}>
  Submit
</Button>
```

## Combined Example
```tsx
<Button 
  variant="primary"
  size="md"
  isLoading={isLoading}
  disabled={!canSubmit}
  onClick={handleSubmit}
  className="w-full"
>
  Submit Form
</Button>
```

## All Props
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `disabled`: boolean
- `className`: string (additional CSS classes)
- `children`: React.ReactNode
- All standard button HTML attributes (onClick, type, etc.)
