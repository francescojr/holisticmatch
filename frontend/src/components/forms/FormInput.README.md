# FormInput Component

A reusable form input component with built-in validation states, animations, and accessibility features.

## Features

- ✅ **Inline Validation**: Real-time error display with animated messages
- 🎯 **Status Indicators**: Visual feedback with icons (✓ success, ✗ error, ⟳ loading)
- ♿ **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation
- 🎭 **Animations**: Smooth transitions using Framer Motion
- 🎨 **TailwindCSS**: Consistent styling with the design system
- 📝 **TypeScript**: Full type safety and IntelliSense support
- 🔧 **Flexible**: Supports all HTML input types and additional props

## Props

```typescript
interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string                    // Required: Input label text
  value: string | number          // Required: Input value
  onChange: (value: string) => void // Required: Change handler
  error?: string | null           // Optional: Error message
  isValidating?: boolean          // Optional: Loading state
}
```

## Usage Examples

### Basic Usage

```tsx
import FormInput from './components/forms/FormInput'

function MyForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <FormInput
      label="Email"
      type="email"
      value={email}
      onChange={setEmail}
      error={error}
      placeholder="seu@email.com"
      required
    />
  )
}
```

### With Validation Hook

```tsx
import { useFormValidation } from './hooks/useFormValidation'
import FormInput from './components/forms/FormInput'

function MyForm() {
  const { errors, validate } = useFormValidation()
  const [email, setEmail] = useState('')

  const handleEmailChange = (value: string) => {
    setEmail(value)
    validate('email', value, { required: true, email: true })
  }

  return (
    <FormInput
      label="Email"
      type="email"
      value={email}
      onChange={handleEmailChange}
      error={errors.email}
      placeholder="seu@email.com"
      required
    />
  )
}
```

### With Async Validation

```tsx
function MyForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateEmail = async (value: string) => {
    setIsValidating(true)
    try {
      const response = await api.checkEmailAvailability(value)
      setError(response.available ? null : 'Email já cadastrado')
    } catch {
      setError('Erro ao validar email')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <FormInput
      label="Email"
      type="email"
      value={email}
      onChange={(value) => {
        setEmail(value)
        setError(null) // Clear error on change
      }}
      onBlur={() => validateEmail(email)}
      error={error}
      isValidating={isValidating}
      placeholder="seu@email.com"
      required
    />
  )
}
```

## Validation States

### Error State
- Red border and error icon (✗)
- Animated error message below input
- Accessible error announcement

### Success State
- Green border and check icon (✓)
- Only shown when input has value and no errors

### Loading State
- Yellow loading icon (⟳) with rotation animation
- "Validando..." message
- Disabled success/error icons during validation

## Styling

The component uses TailwindCSS classes and integrates with the project's design system:

- **Colors**: Uses custom color palette (`primary`, `accent-red`, `accent-yellow`, etc.)
- **Typography**: Consistent text sizing and weights
- **Spacing**: Standardized padding and margins
- **Borders**: Rounded corners and focus states
- **Animations**: Framer Motion for smooth transitions

## Accessibility

- Proper `label` association with `htmlFor` attribute
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management and visual indicators
- Required field indicators (*)

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- React 18+ required for proper ref forwarding
- Framer Motion for animations (optional, graceful degradation)

## Testing

The component includes comprehensive unit tests covering:

- ✅ Basic rendering and props
- ✅ Input types and value handling
- ✅ Validation states (error, success, loading)
- ✅ Accessibility features
- ✅ Styling and animations
- ✅ Props forwarding and ref handling

Run tests with: `npm test FormInput.test.tsx`