import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BoardingPass = {
  id: string
  passengerName: string
  operatingCarrierPNR: string
  departureAirport: string
  arrivalAirport: string
  operatingCarrierDesignator: string
  flightNumber: string
  flightDate: Date
  seatNumber: string
  checkInSequenceNumber: string
  airlineName: string
  airlineLogoUrl: string
  departureCity: string
  arrivalCity: string
  rawAztecData: string
  themeColor: string
}

interface PassStore {
  passes: BoardingPass[]
  addPass: (pass: BoardingPass) => void
  removePass: (id: string) => void
}

export const usePassStore = create<PassStore>()(
  persist(
    (set) => ({
      passes: [],
      addPass: (pass) => set((state) => ({ passes: [...state.passes, pass] })),
      removePass: (id) => set((state) => ({ passes: state.passes.filter((p) => p.id !== id) })),
    }),
    {
      name: 'boarding-passes-storage',
    },
  ),
)
