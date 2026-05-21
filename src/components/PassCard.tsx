import { Card, CardContent } from './ui/card'
import type { BoardingPass } from '../types/BoardingPass'
import { Plane } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PassCard({ pass }: { pass: BoardingPass }) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all overflow-hidden border-none shadow-sm"
      onClick={() => {
        void navigate(`/pass/${pass.id}`)
      }}
    >
      <div className="h-3 w-full" style={{ backgroundColor: pass.themeColor }} />
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="text-3xl font-black">{pass.origin}</div>
          <Plane className="text-muted-foreground w-6 h-6 rotate-90" />
          <div className="text-3xl font-black">{pass.destination}</div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground font-medium">
          <span className="truncate max-w-[60%]">{pass.passengerName}</span>
          <span>{pass.date}</span>
        </div>
        <div className="mt-2 text-xs font-semibold uppercase opacity-60">
          Flight {pass.flightNumber} • Seat {pass.seat}
        </div>
      </CardContent>
    </Card>
  )
}
