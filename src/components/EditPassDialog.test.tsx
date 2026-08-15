import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { EditPassDialog } from './EditPassDialog'
import * as usePassStoreModule from '../store/usePassStore'
import type { BoardingPass } from '../store/usePassStore'

describe('EditPassDialog Component', () => {
  const mockUpdatePass = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(usePassStoreModule, 'usePassStore').mockReturnValue(mockUpdatePass)
  })

  const mockPass = {
    id: '123',
    passengerName: 'Old Name',
    flightDate: new Date('2024-01-01').toISOString(),
    airlineName: 'Old Airline',
    theme: { backgroundColor: '#ffffff', foregroundColor: '#000000' },
  } as unknown as BoardingPass

  it('populates fields with initial pass data', () => {
    render(<EditPassDialog pass={mockPass} open={true} onOpenChange={mockOnOpenChange} />)

    const nameInput = screen.getByDisplayValue('Old Name')
    expect(nameInput).toBeInTheDocument()

    const airlineInput = screen.getByDisplayValue('Old Airline')
    expect(airlineInput).toBeInTheDocument()
  })

  it('updates form data on typing and calls updatePass on save', async () => {
    const user = userEvent.setup()
    render(<EditPassDialog pass={mockPass} open={true} onOpenChange={mockOnOpenChange} />)
    // We can find it by display value for ease in this simple test
    const nameInput = screen.getByDisplayValue('Old Name')

    // Clear and type new name
    await user.clear(nameInput)
    await user.type(nameInput, 'New Name')

    // Click Save
    const saveBtn = screen.getByRole('button', { name: /save changes/i })
    await user.click(saveBtn)

    // Expect the update function from the store to have been called
    expect(mockUpdatePass).toHaveBeenCalledWith(
      '123',
      expect.objectContaining({
        passengerName: 'New Name',
      }),
    )

    // Expect dialog to attempt closing
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
