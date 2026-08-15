import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'
import * as usePassStoreModule from '../store/usePassStore'

// Mock the AddPassDialog to simplify the test output
vi.mock('../components/AddPassDialog', () => ({
  AddPassDialog: () => <div data-testid="add-pass-dialog" />,
}))

describe('Home Component', () => {
  it('renders empty state when there are no passes', () => {
    vi.spyOn(usePassStoreModule, 'usePassStore').mockReturnValue({ passes: [] })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByText('No passes yet')).toBeInTheDocument()
    expect(screen.getByText(/Add a screenshot/i)).toBeInTheDocument()
  })

  it('renders a list of PassCards when passes exist', () => {
    const mockPasses = [
      {
        id: '1',
        passengerName: 'John',
        flightDate: new Date('2024-01-01').toISOString(),
        departureAirport: 'JFK',
        arrivalAirport: 'LHR',
        theme: {},
      },
      {
        id: '2',
        passengerName: 'Jane',
        flightDate: new Date('2024-02-01').toISOString(),
        departureAirport: 'LAX',
        arrivalAirport: 'SFO',
        theme: {},
      },
    ]

    vi.spyOn(usePassStoreModule, 'usePassStore').mockReturnValue({ passes: mockPasses })

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    // Should not see empty state
    expect(screen.queryByText('No passes yet')).not.toBeInTheDocument()

    // Should render two pass cards (we can check for text that PassCard renders)
    expect(screen.getByText('JFK to LHR')).toBeInTheDocument()
    expect(screen.getByText('LAX to SFO')).toBeInTheDocument()
  })
})
