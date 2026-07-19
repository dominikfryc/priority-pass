import type { BoardingPass } from '../store/usePassStore'
import { Link, useNavigate } from 'react-router-dom'
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
    <Link
      to={`/pass/${pass.id}`}
      onClick={(e) => {
        if (document.startViewTransition) {
          e.preventDefault()
          document.startViewTransition({
            update: () => void navigate(`/pass/${pass.id}`),
            types: ['forward'],
          })
        }
      }}
      className="cursor-pointer bg-card rounded-3xl overflow-hidden flex gap-4 items-center p-5 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background text-left w-full"
      onKeyDown={(e) => {
        if (e.key === ' ') {
          e.preventDefault()
          e.currentTarget.click()
        }
      }}
    >
      {pass.airlineLogoUrl ? (
        <div className="w-12 h-12 rounded-full border border-white/50 flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={pass.airlineLogoUrl}
            alt={pass.airlineName}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0">
          <MdFlight className="w-6 h-6 text-white rotate-90" />
        </div>
      )}
      <div className="grid gap-1">
        <div className="font-medium text-md">
          {origin} to {destination}
        </div>
        <div className="text-sm text-muted-foreground font-normal">
          {passengerName}, {date}
        </div>
      </div>
    </Link>
  )
}
