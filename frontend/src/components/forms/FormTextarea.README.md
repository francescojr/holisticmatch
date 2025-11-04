# FormTextarea Component

Reusable textarea component with inline validation, character counter, and auto-resize functionality.

## Features

- **Auto-resize**: Automatically adjusts height based on content
- **Character counter**: Shows current/max characters with color coding
- **Length validation**: Min/max length validation with visual feedback
- **Error handling**: Custom error messages with animations
- **Accessibility**: Full ARIA support and keyboard navigation
- **TypeScript**: Fully typed with proper interfaces
- **Animations**: Smooth transitions using Framer Motion

## Props

```typescript
interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> {
  label: string                    // Label text for the textarea
  value: string                    // Current value
  onChange: (value: string) => void // Change handler
  error?: string | null           // Error message (prioritized over length validation)
  maxLength?: number              // Maximum character limit
  minLength?: number              // Minimum character limit
  showCounter?: boolean           // Show character counter (default: true)
}
```

## Usage

```tsx
import { FormTextarea } from '@/components/forms'

function MyForm() {
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <FormTextarea
      label="Description"
      value={description}
      onChange={setDescription}
      error={error}
      maxLength={500}
      minLength={10}
      placeholder="Enter your description..."
      required
    />
  )
}
```

## Validation States

- **Normal**: Default border styling
- **Success**: Green border when has value and no errors
- **Error**: Red border with error message animation
- **Warning**: Yellow warning for minLength violations

## Character Counter Colors

- **Normal**: `text-subtext-light` (gray)
- **Near limit**: `text-accent-yellow` (80% of maxLength)
- **Over limit**: `text-accent-red` (exceeds maxLength)

## Accessibility

- Proper `label` association with `htmlFor`
- ARIA attributes for required fields
- Keyboard navigation support
- Screen reader friendly error messages

## Styling

Built with TailwindCSS classes:
- Responsive design
- Dark/light theme support
- Custom color palette integration
- Smooth transitions and animations

## Dependencies

- React 18+
- Framer Motion for animations
- TailwindCSS for styling
- Material Symbols for icons