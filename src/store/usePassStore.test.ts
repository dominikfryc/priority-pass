import { describe, it, expect, beforeEach } from 'vitest'
import { usePassStore, type BoardingPass } from './usePassStore'

describe('usePassStore', () => {
  // Clear the store before each test
  beforeEach(() => {
    usePassStore.setState({ passes: [], sharedFile: null })
  })

  const mockPass: BoardingPass = {
    id: '123',
    passengerName: 'John Doe',
    operatingCarrierPNR: 'ABCDEF',
    departureAirport: 'JFK',
    arrivalAirport: 'LHR',
    operatingCarrierDesignator: 'BA',
    flightNumber: '123',
    flightDate: new Date('2024-01-01'),
    seatNumber: '1A',
    checkInSequenceNumber: '001',
    airlineName: 'British Airways',
    airlineLogoUrl: '/logos/ba.png',
    departureCity: 'New York',
    arrivalCity: 'London',
    rawAztecData: 'raw-data',
    theme: { backgroundColor: '#fff', foregroundColor: '#000' },
    palette: [],
  }

  it('should start with empty passes', () => {
    const { passes } = usePassStore.getState()
    expect(passes).toEqual([])
  })

  it('should add a pass', () => {
    usePassStore.getState().addPass(mockPass)
    const { passes } = usePassStore.getState()
    expect(passes).toHaveLength(1)
    expect(passes[0]).toEqual(mockPass)
  })

  it('should update a pass', () => {
    usePassStore.getState().addPass(mockPass)

    const updatedPass = { ...mockPass, passengerName: 'Jane Doe' }
    usePassStore.getState().updatePass('123', updatedPass)

    const { passes } = usePassStore.getState()
    expect(passes[0].passengerName).toBe('Jane Doe')
  })

  it('should remove a pass', () => {
    usePassStore.getState().addPass(mockPass)
    expect(usePassStore.getState().passes).toHaveLength(1)

    usePassStore.getState().removePass('123')

    expect(usePassStore.getState().passes).toHaveLength(0)
  })

  it('should set shared file', () => {
    const file = new File([''], 'test.png', { type: 'image/png' })
    usePassStore.getState().setSharedFile(file)
    expect(usePassStore.getState().sharedFile).toBe(file)
  })
})
