import { useParams, useNavigate } from 'react-router-dom'
import { usePassStore } from '../store/usePassStore'
import { BarcodeRenderer } from '../components/BarcodeRenderer'
import { MdArrowBack, MdFlight } from 'react-icons/md'

export function PassDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { passes } = usePassStore()

  const pass = passes.find((p) => p.id === id)

  if (!pass) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground text-lg">Pass not found</p>
        <button
          className="border px-4 py-2 rounded-md"
          onClick={() => {
            void navigate('/')
          }}
        >
          Return Home
        </button>
      </div>
    )
  }

  const originCode = pass.origin
  const destCode = pass.destination
  const flightNumber = pass.flightNumber
  const passengerName = pass.passengerName
  const seat = pass.seat
  const sequence = '184'
  const gateCloses = 'Nov 2, 2025, 5:45 PM'

  const seatRowMatch = seat?.match(/\d+/)
  const seatRow = seatRowMatch ? parseInt(seatRowMatch[0], 10) : 0
  const boardingDoor = seatRow >= 17 ? 'Back' : 'Front'

  const isBcnPrg = originCode === 'BCN' && destCode === 'PRG'
  const routeText = isBcnPrg ? 'Barcelona to Prague' : `${originCode} to ${destCode}`

  return (
    <div className="grid px-4 py-8 gap-6 font-sans text-white">
      <button
        onClick={() => {
          void navigate('/')
        }}
        className="text-white p-2"
      >
        <MdArrowBack className="w-6 h-6" />
      </button>

      <div
        className="w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#25418F' }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              {/* Mock Ryanair Logo */}
              <div className="w-8 h-8 rounded-full border-[1.5px] border-white/30 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-[#f9c933] fill-current">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.5 0-4.5-2-4.5-4.5S8.5 7.5 11 7.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z" />
                </svg>
              </div>
              <span className="font-normal text-md">Ryanair</span>
            </div>
            <span className="font-normal text-md">{flightNumber}</span>
          </div>

          <div
            className="h-px w-full bg-white/10 mb-6 -mx-6 px-12"
            style={{ width: 'calc(100% + 48px)' }}
          />

          {/* Route Section */}
          <div className="mb-8">
            <div className="text-md font-normal opacity-90 mb-2">{routeText}</div>
            <div className="flex items-center gap-3 text-5xl font-normal">
              <span>{originCode}</span>
              <MdFlight className="w-8 h-8 rotate-90 opacity-90 mx-1" />
              <span>{destCode}</span>
            </div>
          </div>

          {/* Grid 1 */}
          <div className="flex justify-between mb-8">
            <div>
              <div className="text-sm font-normal opacity-90">Boarding Door</div>
              <div className="font-normal text-md">{boardingDoor}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-normal opacity-90">Gate Closes</div>
              <div className="font-normal text-md">{gateCloses}</div>
            </div>
          </div>

          <div
            className="h-px w-full bg-white/10 mb-6 -mx-6 px-12"
            style={{ width: 'calc(100% + 48px)' }}
          />

          {/* Grid 2 */}
          <div className="flex justify-between mb-8">
            <div>
              <div className="text-sm font-light opacity-90">Passenger</div>
              <div className="font-normal text-md">{passengerName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-light opacity-90">Sequence / Seat</div>
              <div className="font-normal text-md">
                {sequence} / {seat}
              </div>
            </div>
          </div>

          {/* Subtext */}
          <div className="text-center text-xs font-light mb-4 mt-6 opacity-90">
            Priority & 2 Cabin bags
          </div>

          {/* Barcode */}
          <div className="flex justify-center pb-2">
            <BarcodeRenderer data={pass.rawAztecData} />
          </div>
        </div>
      </div>
    </div>
  )
}
