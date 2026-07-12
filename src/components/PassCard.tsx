import type { BoardingPass } from '../store/usePassStore'
import { useNavigate } from 'react-router-dom'
import { formatPassengerName } from '../lib/formatName'
import { MdFlight } from 'react-icons/md'

export function PassCard({ pass }: { pass: BoardingPass }) {
  const navigate = useNavigate()

  const origin = pass.departureAirport || ''
  const destination = pass.arrivalAirport || ''
  const passengerName = formatPassengerName(pass.passengerName)
  const flightDateRaw = pass.flightDate
  const date = flightDateRaw
    ? new Date(flightDateRaw).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : ''

  return (
    <div
      className="cursor-pointer bg-card rounded-3xl overflow-hidden flex gap-4 items-center p-5"
      onClick={() => {
        void navigate(`/pass/${pass.id}`)
      }}
    >
      {pass.airlineLogoUrl ? (
        <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={pass.airlineLogoUrl}
            alt={pass.airlineName}
            className="w-full h-full object-contain p-1"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
          <MdFlight className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="grid gap-1">
        <div className="font-normal text-md">
          {origin} to {destination}
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {passengerName}, {date}
        </div>
      </div>
    </div>
  )
}
