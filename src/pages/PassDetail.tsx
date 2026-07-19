import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePassStore } from '../store/usePassStore'
import { BarcodeRenderer } from '../components/BarcodeRenderer'
import {
  MdArrowBack,
  MdFlight,
  MdMoreVert,
  MdAirplaneTicket,
  MdOutlineEdit,
  MdDeleteOutline,
} from 'react-icons/md'
import { formatPassengerName } from '../lib/formatName'
import { EditPassDialog } from '../components/EditPassDialog'
import { RemovePassDialog } from '../components/RemovePassDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

export function PassDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { passes } = usePassStore()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const pass = passes.find((p) => p.id === id)

  useEffect(() => {
    if (pass) {
      document.title = `${pass.departureAirport} to ${pass.arrivalAirport}`
    } else {
      document.title = 'Pass Not Found'
    }
  }, [pass])

  if (!pass) {
    return (
      <div className="flex flex-col items-center justify-center h-svh text-center">
        <div className="bg-muted p-6 rounded-full mb-6">
          <MdAirplaneTicket className="w-12 h-12 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-normal mb-2">Pass not found</h2>
        <p className="text-muted-foreground max-w-xs mb-6">
          The pass you are looking for does not exist or has been removed.
        </p>
        <Link
          className="whitespace-nowrap flex items-center justify-center rounded-full shadow-lg h-14 px-6 gap-2 text-base font-medium bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          to="/"
        >
          Return to home
        </Link>
      </div>
    )
  }

  const originCode = pass.departureAirport
  const destCode = pass.arrivalAirport || ''
  const flightNumber = `${pass.operatingCarrierDesignator || ''} ${pass.flightNumber || ''}`.trim()
  const passengerName = formatPassengerName(pass.passengerName)
  const seat = (pass.seatNumber || '').replace(/^0/, '')
  const sequence = (pass.checkInSequenceNumber || '').replace(/^0/, '')
  const gateCloses = new Date(pass.flightDate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const seatRowMatch = seat?.match(/\d+/)
  const seatRow = seatRowMatch ? parseInt(seatRowMatch[0], 10) : 0
  const boardingDoor = seatRow >= 17 ? 'Back' : 'Front'

  return (
    <div className="grid p-4 gap-4 font-sans text-white">
      <div className="flex justify-between items-center">
        <Link
          to="/"
          onClick={(e) => {
            if (document.startViewTransition) {
              e.preventDefault()
              document.startViewTransition({
                update: () => void navigate('/'),
                types: ['backward'],
              })
            }
          }}
          className="p-3 cursor-pointer w-fit rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background block"
        >
          <MdArrowBack className="w-6 h-6" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 cursor-pointer w-fit rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <MdMoreVert className="w-6 h-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-max">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <MdOutlineEdit className="size-5" />
              <span>Edit pass</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
              <MdDeleteOutline className="size-5" />
              <span>Remove pass</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
              {pass.airlineLogoUrl ? (
                <div className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={pass.airlineLogoUrl}
                    alt={pass.airlineName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border-[1.5px] border-current opacity-70 flex items-center justify-center shrink-0">
                  <MdFlight className="w-4.5 h-4.5 rotate-90" />
                </div>
              )}
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
            <div className="text-md font-medium opacity-90 mb-2">
              {pass.departureCity} to {pass.arrivalCity}
            </div>
            <div className="flex items-center gap-3 text-5xl font-normal">
              <span>{originCode}</span>
              <MdFlight className="w-8 h-8 rotate-90 opacity-90 mx-1" />
              <span>{destCode}</span>
            </div>
          </div>

          {/* Grid 1 */}
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-normal opacity-90">Boarding Door</div>
              <div className="font-medium text-md">{boardingDoor}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-normal opacity-90">Gate Closes</div>
              <div className="font-medium text-md">{gateCloses}</div>
            </div>
          </div>

          <div
            className="h-px w-full my-4 px-12 opacity-20 mx-auto"
            style={{ backgroundColor: pass.theme.foregroundColor }}
          />

          {/* Grid 2 */}
          <div className="flex justify-between mb-8">
            <div>
              <div className="text-sm font-light opacity-90">Passenger</div>
              <div className="font-medium text-md">{passengerName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-light opacity-90">Sequence / Seat</div>
              <div className="font-medium text-md">
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

      <EditPassDialog pass={pass} open={editOpen} onOpenChange={setEditOpen} />
      <RemovePassDialog passId={pass.id} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}
