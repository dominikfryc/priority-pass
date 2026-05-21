import { useParams, useNavigate } from 'react-router-dom'
import { usePassStore } from '../store/usePassStore'
import { BarcodeRenderer } from '../components/BarcodeRenderer'
import { ChevronLeft, Plane } from 'lucide-react'
import { Button } from '../components/ui/button'

export function PassDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { passes, removePass } = usePassStore()

  const pass = passes.find((p) => p.id === id)

  if (!pass) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground text-lg">Pass not found</p>
        <Button
          variant="outline"
          onClick={() => {
            void navigate('/')
          }}
        >
          Return Home
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    removePass(pass.id)
    void navigate('/')
  }

  return (
    <div className="min-h-screen bg-background md:py-10">
      <div className="max-w-md mx-auto bg-card min-h-[100svh] md:min-h-[850px] md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        <div
          className="h-40 p-6 text-white flex flex-col justify-between"
          style={{ backgroundColor: pass.themeColor }}
        >
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                void navigate('/')
              }}
              className="p-2 -ml-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <span className="font-bold text-lg tracking-wide">{pass.flightNumber}</span>
            <div className="w-10"></div> {/* Spacer */}
          </div>

          <div className="px-2 pb-2">
            <p className="text-sm opacity-80 uppercase tracking-widest font-semibold mb-1">
              Passenger
            </p>
            <p className="text-xl font-bold truncate">{pass.passengerName}</p>
          </div>
        </div>

        <div className="px-8 py-8 flex-grow flex flex-col bg-white">
          <div className="flex justify-between items-center mb-10">
            <div className="text-center w-1/3">
              <div className="text-5xl font-black mb-1 text-foreground">{pass.origin}</div>
            </div>
            <div className="w-1/3 flex justify-center text-muted-foreground opacity-50">
              <Plane className="w-10 h-10 rotate-90" />
            </div>
            <div className="text-center w-1/3">
              <div className="text-5xl font-black mb-1 text-foreground">{pass.destination}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-8 gap-x-6 mb-10">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                Date
              </p>
              <p className="text-2xl font-bold">{pass.date}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                Seat
              </p>
              <p className="text-2xl font-bold">{pass.seat}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                Booking Reference (PNR)
              </p>
              <p className="text-2xl font-bold tracking-widest">{pass.pnr}</p>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t-2 border-dashed border-border flex flex-col items-center justify-center">
            <BarcodeRenderer data={pass.rawAztecData} />
            <p className="text-sm text-muted-foreground mt-6 uppercase tracking-widest font-mono font-semibold">
              {pass.pnr} • {pass.seat}
            </p>
          </div>

          <div className="mt-8 flex justify-center pb-4 md:pb-0">
            <Button
              variant="ghost"
              className="text-destructive/80 hover:text-destructive"
              onClick={handleDelete}
            >
              Delete Pass
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
