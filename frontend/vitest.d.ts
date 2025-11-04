/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { Assertion, AsymmetricMatchersContaining } from 'vitest'

interface CustomMatchers<R> {
  toBeInTheDocument(): R
  toBeVisible(): R
  toBeDisabled(): R
  toBeEnabled(): R
  toHaveClass(className: string): R
  toHaveTextContent(text: string): R
  toHaveValue(value: string | number | string[]): R
  toHaveFocus(): R
  toBeChecked(): R
  toBePartiallyChecked(): R
  toHaveFormValues(values: Record<string, string>): R
  toHaveErrorMessage(message: string): R
  toContainHTML(html: string): R
}

declare global {
  namespace Vi {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}
