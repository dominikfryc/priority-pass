import { MdFlight } from 'react-icons/md'
import { getLocalImageUrl } from '../lib/utils'
import { BarcodeRenderer } from './BarcodeRenderer'
import type { BoardingPass } from '../store/usePassStore'

interface FullPassCardProps {
  pass: BoardingPass
}

export function FullPassCard({ pass }: FullPassCardProps) {
  const originCode = pass.departureAirport
  const destCode = pass.arrivalAirport
  const flightNumber = `${pass.operatingCarrierDesignator} ${pass.flightNumber}`.trim()
  const passengerName = pass.passengerName
  const seat = pass.seatNumber
  const sequence = pass.checkInSequenceNumber
  const departure = new Date(pass.flightDate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const seatRowMatch = seat?.match(/\d+/)
  const seatRow = seatRowMatch ? parseInt(seatRowMatch[0], 10) : 0
  const boardingDoor = seatRow >= 15 ? 'Back' : 'Front'

  return (
    <div
      className="w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: pass.theme.backgroundColor,
        color: pass.theme.foregroundColor,
      }}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden"
              style={{
                boxShadow: `0 0 0 1px color-mix(in srgb, ${pass.theme.foregroundColor} 20%, transparent)`,
              }}
            >
              {pass.airlineLogoUrl ? (
                <img
                  src={getLocalImageUrl(pass.airlineLogoUrl)}
                  alt={pass.airlineName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <MdFlight className="w-4.5 h-4.5 text-black rotate-90" />
              )}
            </div>
            <span className="font-medium text-md">
              {pass.airlineName || pass.operatingCarrierDesignator}
            </span>
          </div>
          <span className="font-medium text-md">{flightNumber}</span>
        </div>

        <div
          className="h-px w-full mb-6 -mx-6 px-12 opacity-20"
          style={{ width: 'calc(100% + 48px)', backgroundColor: pass.theme.foregroundColor }}
        />

        {/* Route Section */}
        <div className="mb-8">
          <div className="text-md font-medium mb-2">
            {pass.departureCity} to {pass.arrivalCity}
          </div>
          <div className="flex items-center gap-3 text-5xl font-normal">
            <span>{originCode}</span>
            <MdFlight className="w-8 h-8 rotate-90 mx-1" />
            <span>{destCode}</span>
          </div>
        </div>

        {/* Grid 1 */}
        <div className="flex justify-between">
          <div>
            <div className="text-sm font-light">Passenger</div>
            <div className="font-medium text-md">{passengerName}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-normal">Departure</div>
            <div className="font-medium text-md">{departure}</div>
          </div>
        </div>

        <div
          className="h-px w-full my-4 px-12 opacity-20 mx-auto"
          style={{ backgroundColor: pass.theme.foregroundColor }}
        />

        {/* Grid 2 */}
        <div className="flex justify-between mb-8">
          <div>
            <div className="text-sm font-normal">Boarding Door</div>
            <div className="font-medium text-md">{boardingDoor}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-light">Sequence / Seat</div>
            <div className="font-medium text-md">
              {sequence} / {seat}
            </div>
          </div>
        </div>

        {/* Subtext */}
        <div className="text-center text-xs font-light mb-4 mt-6">Priority & 2 Cabin bags</div>

        {/* Barcode */}
        <div className="flex justify-center pb-2">
          <BarcodeRenderer data={pass.rawAztecData} />
        </div>
      </div>
    </div>
  )
}
