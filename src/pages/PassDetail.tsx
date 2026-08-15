import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { usePassStore } from '../store/usePassStore'
import { FullPassCard } from '../components/FullPassCard'
import {
  MdArrowBack,
  MdMoreVert,
  MdAirplaneTicket,
  MdOutlineEdit,
  MdDeleteOutline,
} from 'react-icons/md'
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
      document.title = 'Pass not found'
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
          className="whitespace-nowrap flex items-center justify-center rounded-full shadow-lg h-14 px-6 gap-2 text-base font-medium bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          to="/"
        >
          Return to home
        </Link>
      </div>
    )
  }

  return (
    <div className="grid p-4 gap-4 font-sans text-foreground">
      <div className="flex justify-between items-center">
        <Link
          to="/"
          aria-label="Back to home"
          onClick={(e) => {
            if (document.startViewTransition) {
              e.preventDefault()
              document.startViewTransition({
                update: () => void navigate('/'),
                types: ['backward'],
              })
            }
          }}
          className="p-3 cursor-pointer w-fit rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background block"
        >
          <MdArrowBack className="w-6 h-6" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Open menu"
            className="p-2 cursor-pointer w-fit rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
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

      <FullPassCard pass={pass} />

      <EditPassDialog pass={pass} open={editOpen} onOpenChange={setEditOpen} />
      <RemovePassDialog passId={pass.id} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}
