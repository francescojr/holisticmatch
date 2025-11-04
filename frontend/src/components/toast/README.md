# Toast Notification System

Elegant and accessible toast notification system with auto-dismiss, stacking, and smooth animations.

## Features

- **Multiple Toast Types**: Success, error, warning, and info notifications
- **Auto-dismiss**: Configurable duration with automatic cleanup
- **Stack Management**: Maximum 5 toasts with automatic removal of oldest
- **Smooth Animations**: Framer Motion animations for enter/exit transitions
- **Accessibility**: Full ARIA support and keyboard navigation
- **TypeScript**: Complete type safety with proper interfaces
- **Customizable**: Configurable duration and messages

## Installation

The toast system consists of three parts:

1. **useToast hook** - Manages toast state and actions
2. **Toast component** - Individual notification display
3. **ToastContainer component** - Container for stacking multiple toasts

## Basic Usage

```tsx
import { useToast, ToastContainer } from '@/components/toast'

// In your app component
function App() {
  const { toasts, toast, dismiss } = useToast()

  return (
    <>
      {/* Your app content */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

// In any component
function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast.success('Operation completed successfully!')
  }

  const handleError = () => {
    toast.error('Something went wrong', {
      message: 'Please try again later'
    })
  }

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  )
}
```

## API Reference

### useToast Hook

```typescript
const { toasts, toast, dismiss, dismissAll } = useToast()
```

#### Returns

- `toasts: Toast[]` - Array of active toast notifications
- `toast` - Object with toast creation methods
- `dismiss(id: string)` - Function to dismiss a specific toast
- `dismissAll()` - Function to dismiss all toasts

#### Toast Methods

```typescript
toast.success(title: string, options?: ToastOptions)
toast.error(title: string, options?: ToastOptions)
toast.warning(title: string, options?: ToastOptions)
toast.info(title: string, options?: ToastOptions)
```

#### ToastOptions

```typescript
interface ToastOptions {
  duration?: number    // Auto-dismiss duration in ms (default: 3000)
  message?: string     // Optional detailed message
}
```

### Toast Component

```tsx
<Toast toast={toast} onDismiss={onDismiss} />
```

#### Props

- `toast: Toast` - Toast object from useToast hook
- `onDismiss: (id: string) => void` - Dismiss callback function

### ToastContainer Component

```tsx
<ToastContainer toasts={toasts} onDismiss={onDismiss} />
```

#### Props

- `toasts: Toast[]` - Array of toast objects
- `onDismiss: (id: string) => void` - Dismiss callback function

## Toast Types

| Type | Description | Icon | Background Color |
|------|-------------|------|------------------|
| `success` | Positive feedback | check_circle | Green |
| `error` | Error messages | error | Red |
| `warning` | Warning messages | warning | Yellow |
| `info` | Information | info | Blue |

## Advanced Usage

### Custom Duration

```tsx
const { toast } = useToast()

// Toast that stays for 5 seconds
toast.success('Long message', { duration: 5000 })

// Toast that doesn't auto-dismiss
toast.info('Persistent message', { duration: 0 })
```

### Detailed Messages

```tsx
toast.error('Upload failed', {
  message: 'The file size exceeds the 5MB limit. Please choose a smaller file.'
})
```

### Manual Dismiss

```tsx
const { toast, dismiss } = useToast()

const showToast = () => {
  const toastId = toast.success('Click to dismiss').id
  // Later...
  dismiss(toastId)
}
```

### Dismiss All

```tsx
const { toast, dismissAll } = useToast()

const clearNotifications = () => {
  dismissAll()
}
```

## Styling

The toast system uses TailwindCSS classes with a custom design system:

- **Colors**: Uses semantic color tokens (primary, accent-red, etc.)
- **Typography**: Consistent font weights and sizes
- **Spacing**: Standardized padding and margins
- **Shadows**: Subtle shadow for depth
- **Borders**: Rounded corners with color-coded borders

## Accessibility

- **ARIA live regions**: `aria-live="assertive"` for screen readers
- **Role attributes**: `role="alert"` for individual toasts
- **Keyboard navigation**: Focus management and keyboard dismissal
- **Semantic markup**: Proper heading hierarchy and button labels
- **Color contrast**: WCAG compliant color combinations

## Animation Details

Uses Framer Motion for smooth animations:

- **Enter**: Slide in from right with spring physics
- **Exit**: Slide out to right with fade
- **Stagger**: Stacked toasts animate in sequence
- **Duration**: 200ms transitions with easing

## Performance

- **Memory management**: Automatic cleanup of timeouts
- **Limited stacking**: Maximum 5 toasts to prevent UI clutter
- **Efficient re-renders**: Optimized with React.useCallback
- **Lightweight**: Minimal bundle size impact

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- React 18+ required
- Framer Motion 10+ for animations

## Dependencies

- React 18+
- Framer Motion (animations)
- TailwindCSS (styling)
- Material Symbols (icons)