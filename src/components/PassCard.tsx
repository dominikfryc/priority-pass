import type { BoardingPass } from '../types/BoardingPass'
import { useNavigate } from 'react-router-dom'

export function PassCard({ pass }: { pass: BoardingPass }) {
  const navigate = useNavigate()

  return (
    <div
      className="cursor-pointer bg-card rounded-3xl overflow-hidden flex gap-4 items-center p-5"
      onClick={() => {
        void navigate(`/pass/${pass.id}`)
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-12 h-12 p-2 text-[#f9c933] fill-current bg-blue-700 rounded-full"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5c-2.5 0-4.5-2-4.5-4.5S8.5 7.5 11 7.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z" />
      </svg>
      <div className="grid gap-1">
        <div className="font-normal text-md">
          {pass.origin} to {pass.destination}
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {pass.passengerName}, {pass.date}
        </div>
      </div>
    </div>
  )
}
