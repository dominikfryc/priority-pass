import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PassCard } from './PassCard'
import type { BoardingPass } from '../store/usePassStore'

describe('PassCard Component', () => {
  const mockPass: BoardingPass = {
    id: '12345',
    passengerName: 'Doe John',
    operatingCarrierPNR: 'ABCDEF',
    departureAirport: 'JFK',
    arrivalAirport: 'LHR',
    operatingCarrierDesignator: 'BA',
    flightNumber: '112',
    flightDate: new Date('2024-12-25T10:00:00Z'),
    seatNumber: '12A',
    checkInSequenceNumber: '001',
    airlineName: 'British Airways',
    airlineLogoUrl: '/logos/ba.png',
    departureCity: 'New York',
    arrivalCity: 'London',
    rawAztecData: 'raw',
    theme: { backgroundColor: '#fff', foregroundColor: '#000' },
    palette: [],
  }

  it('renders pass information correctly', () => {
    render(
      <MemoryRouter>
        <PassCard pass={mockPass} />
      </MemoryRouter>,
    )

    // It should display "JFK to LHR"
    expect(screen.getByText('JFK to LHR')).toBeInTheDocument()

    // It should display the passenger name and formatted date
    // Date formatting depends on locale, but let's check for the name at least
    const detailsText = screen.getByText(/Doe John/i)
    expect(detailsText).toBeInTheDocument()
  })

  it('renders fallback when airport codes are missing', () => {
    const incompletePass = {
      ...mockPass,
      departureAirport: '',
      arrivalAirport: '',
    }

    render(
      <MemoryRouter>
        <PassCard pass={incompletePass} />
      </MemoryRouter>,
    )

    // Should display " to "
    expect(screen.getByText('to')).toBeInTheDocument()
  })
})
