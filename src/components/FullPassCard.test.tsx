import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FullPassCard } from './FullPassCard'
import type { BoardingPass } from '../store/usePassStore'

describe('FullPassCard Component', () => {
  const mockPass: BoardingPass = {
    id: 'pass-1',
    passengerName: 'Jane Smith',
    operatingCarrierPNR: 'ZYXWVU',
    departureAirport: 'SFO',
    arrivalAirport: 'LAX',
    operatingCarrierDesignator: 'UA',
    flightNumber: '456',
    flightDate: new Date('2024-05-10T14:30:00Z'),
    seatNumber: '15F',
    checkInSequenceNumber: '089',
    airlineName: 'United Airlines',
    airlineLogoUrl: '',
    departureCity: 'San Francisco',
    arrivalCity: 'Los Angeles',
    rawAztecData: 'raw-data',
    theme: { backgroundColor: '#0000ff', foregroundColor: '#ffffff' },
    palette: [],
  }

  it('renders all passenger and flight details', () => {
    render(<FullPassCard pass={mockPass} />)

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('UA 456')).toBeInTheDocument()
    expect(screen.getByText('SFO')).toBeInTheDocument()
    expect(screen.getByText('LAX')).toBeInTheDocument()
    expect(screen.getByText(/San Francisco to Los Angeles/i)).toBeInTheDocument()

    // Check sequence and seat
    expect(screen.getByText('089 / 15F')).toBeInTheDocument()

    // Boarding door logic: row >= 15 is 'Back', else 'Front'
    // Seat is 15F, so row is 15 -> 'Back'
    expect(screen.getByText('Back')).toBeInTheDocument()
  })

  it('renders "Front" for boarding door when row is < 15', () => {
    const frontPass = { ...mockPass, seatNumber: '4A' }
    render(<FullPassCard pass={frontPass} />)

    expect(screen.getByText('Front')).toBeInTheDocument()
  })
})
