import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processPassImage } from './passParser'

// --- Mocks ---

// Mock zxing
vi.mock('@zxing/browser', () => {
  return {
    BrowserMultiFormatReader: class {
      decodeFromImageElement = vi.fn().mockResolvedValue({
        getText: () => 'M1DOE/JOHN            E123456 SFOJFKUA 0123 123Y015F0089 100',
      })
    },
  }
})

vi.mock('@zxing/library', () => {
  return {
    BarcodeFormat: {
      AZTEC: 'AZTEC',
      PDF_417: 'PDF_417',
      QR_CODE: 'QR_CODE',
      DATA_MATRIX: 'DATA_MATRIX',
    },
    DecodeHintType: { POSSIBLE_FORMATS: 'POSSIBLE_FORMATS' },
  }
})

// Mock bcbp
vi.mock('bcbp', () => {
  return {
    decode: vi.fn().mockReturnValue({
      data: {
        passengerName: 'DOE/JOHN',
        legs: [
          {
            operatingCarrierPNR: 'E123456',
            departureAirport: 'SFO',
            arrivalAirport: 'JFK',
            operatingCarrierDesignator: 'UA',
            flightNumber: '123',
            flightDate: new Date('2024-05-15'),
            seatNumber: '015F',
            checkInSequenceNumber: '0089',
          },
        ],
      },
    }),
  }
})

// Mock node-vibrant
vi.mock('node-vibrant/browser', () => {
  return {
    Vibrant: {
      from: vi.fn().mockReturnThis(),
      getPalette: vi.fn().mockResolvedValue({
        DarkVibrant: { hex: '#111111', titleTextColor: '#eeeeee' },
        Vibrant: { hex: '#222222', titleTextColor: '#dddddd' },
        LightVibrant: { hex: '#333333', titleTextColor: '#cccccc' },
        Muted: { hex: '#444444', titleTextColor: '#bbbbbb' },
        DarkMuted: { hex: '#555555', titleTextColor: '#aaaaaa' },
        LightMuted: { hex: '#666666', titleTextColor: '#999999' },
      }),
    },
  }
})

// Mock sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

// Mock Image load
beforeEach(() => {
  vi.stubGlobal(
    'Image',
    class {
      onload: () => void = () => {}
      onerror: () => void = () => {}
      src = ''
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      }
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('processPassImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock global fetch for airlines and airports JSON
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('airlines.json')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                UA: { name: 'United Airlines', iata: 'UA', icao: 'UAL' },
              }),
          })
        }
        if (url.includes('airports.json')) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                SFO: 'San Francisco',
                JFK: 'New York',
              }),
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      }),
    )
  })

  it('parses boarding pass image correctly', async () => {
    const result = await processPassImage('blob:http://localhost/test-image')

    // Basic fields from bcbp mocked data
    expect(result.passengerName).toBe('John Doe') // Formatted name
    expect(result.operatingCarrierPNR).toBe('E123456')
    expect(result.departureAirport).toBe('SFO')
    expect(result.arrivalAirport).toBe('JFK')
    expect(result.operatingCarrierDesignator).toBe('UA')
    expect(result.flightNumber).toBe('123')

    // Seat number logic should strip leading zeros
    expect(result.seatNumber).toBe('15F')
    expect(result.checkInSequenceNumber).toBe('89')

    // Mapped from JSON
    expect(result.airlineName).toBe('United Airlines')
    expect(result.departureCity).toBe('San Francisco')
    expect(result.arrivalCity).toBe('New York')

    // Validates vibrant theme
    expect(result.theme.backgroundColor).toBe('#111111')
    expect(result.theme.foregroundColor).toBe('#eeeeee')
  })

  it('handles missing or failed fetch requests gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await processPassImage('blob:http://localhost/test-image')

    // Should still resolve, but cities and airline name will be empty
    expect(result.departureAirport).toBe('SFO')
    expect(result.departureCity).toBe('')
    expect(result.airlineName).toBe('')

    // A toast error should be shown
    const { toast } = await import('sonner')
    expect(toast.error).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
