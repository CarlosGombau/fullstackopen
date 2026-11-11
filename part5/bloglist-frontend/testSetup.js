import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// After each test, remove what the test drew on the screen
afterEach(() => {
  cleanup()
})