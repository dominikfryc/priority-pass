export interface BoardingPass {
  id: string // UUID for local indexing
  passengerName: string
  pnr: string // Booking Reference
  origin: string // e.g., JFK
  destination: string // e.g., LHR
  flightNumber: string
  seat: string
  date: string
  rawAztecData: string // The original string, required to regenerate the barcode
  themeColor: string
}
