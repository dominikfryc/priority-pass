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
  theme: {
    backgroundColor: string
    foregroundColor: string
  }
  palette: {
    backgroundColor: string
    foregroundColor: string
  }[]
}

interface PassStore {
  passes: BoardingPass[]
  sharedFile: File | null
  addPass: (pass: BoardingPass) => void
  updatePass: (id: string, updatedPass: BoardingPass) => void
  removePass: (id: string) => void
  setSharedFile: (file: File | null) => void
}

export const usePassStore = create<PassStore>()(
  persist(
    (set) => ({
      passes: [],
      sharedFile: null,
      addPass: (pass) => set((state) => ({ passes: [...state.passes, pass] })),
      updatePass: (id, updatedPass) =>
        set((state) => ({
          passes: state.passes.map((p) => (p.id === id ? updatedPass : p)),
        })),
      removePass: (id) => set((state) => ({ passes: state.passes.filter((p) => p.id !== id) })),
      setSharedFile: (file) => set({ sharedFile: file }),
    }),
    {
      name: 'boarding-passes-storage',
      partialize: (state) => ({ passes: state.passes }), // Do not persist sharedFile
    },
  ),
)
