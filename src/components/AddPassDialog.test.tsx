import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AddPassDialog } from './AddPassDialog'

// Mock the Zustand store so we don't need real state
vi.mock('../store/usePassStore', () => ({
  usePassStore: vi.fn((selector: (state: unknown) => unknown) => {
    // Return mock values for the store properties used in the component
    const mockStore = {
      addPass: vi.fn(),
      sharedFile: null as File | null,
      setSharedFile: vi.fn(),
    }
    return (selector as (state: typeof mockStore) => unknown)(mockStore)
  }),
}))

describe('AddPassDialog Component', () => {
  it('renders the "Add pass" button', () => {
    render(
      <MemoryRouter>
        <AddPassDialog />
      </MemoryRouter>,
    )

    const button = screen.getByRole('button', { name: /add pass/i })
    expect(button).toBeInTheDocument()
  })

  it('renders a hidden file input', () => {
    render(
      <MemoryRouter>
        <AddPassDialog />
      </MemoryRouter>,
    )

    // Get the file input by its type attribute
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()

    // Check if it's visually hidden via Tailwind class
    expect(fileInput).toHaveClass('hidden')
  })
})
