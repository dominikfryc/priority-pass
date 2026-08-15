import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { RemovePassDialog } from './RemovePassDialog'
import * as usePassStoreModule from '../store/usePassStore'
import { MemoryRouter } from 'react-router-dom'

describe('RemovePassDialog Component', () => {
  const mockRemovePass = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(usePassStoreModule, 'usePassStore').mockReturnValue(mockRemovePass)
  })

  it('renders the dialog when open', () => {
    render(
      <MemoryRouter>
        <RemovePassDialog passId="123" open={true} onOpenChange={mockOnOpenChange} />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(/Are you sure you want to remove this boarding pass/i),
    ).toBeInTheDocument()
  })

  it('calls removePass and closes dialog when "Remove" is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <RemovePassDialog passId="123" open={true} onOpenChange={mockOnOpenChange} />
      </MemoryRouter>,
    )

    const removeBtn = screen.getByRole('button', { name: /remove/i })
    await user.click(removeBtn)

    expect(mockRemovePass).toHaveBeenCalledWith('123')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
