import type { BoardingPass } from '../types/BoardingPass'

export function parseBCBP(rawString: string): BoardingPass {
  if (!rawString.startsWith('M1')) {
    throw new Error('Unsupported BCBP format or not a valid boarding pass')
  }

  // Type M format version 1:
  const passengerName = rawString.substring(2, 22).trim()
  const pnr = rawString.substring(23, 30).trim()
  const origin = rawString.substring(30, 33).trim()
  const destination = rawString.substring(33, 36).trim()
  const airline = rawString.substring(36, 39).trim()
  const flightNumber = airline + rawString.substring(39, 44).trim()
  const seat = rawString.substring(48, 52).trim() || 'N/A'
  const julianDate = rawString.substring(44, 47).trim()

  // A very naive date conversion (Julian day of the current year)
  // Since BCBP only contains Julian day (1-366) and no year, we display it as such.
  const dateObj = new Date(new Date().getFullYear(), 0)
  dateObj.setDate(parseInt(julianDate, 10))
  const date = Number.isNaN(dateObj.getTime())
    ? `Day ${julianDate}`
    : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  // Generate a random pleasant hex color for the theme
  const hue = Math.floor(Math.random() * 360)
  const themeColor = `hsl(${hue}, 70%, 50%)`

  return {
    id: crypto.randomUUID(),
    passengerName,
    pnr,
    origin,
    destination,
    flightNumber,
    seat,
    date,
    rawAztecData: rawString,
    themeColor,
  }
}
