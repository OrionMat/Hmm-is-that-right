import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock SVG imports
vi.mock('*.svg?react', () => ({
  default: () => null,
}))
