import { useEffect } from 'react'
import { usePassStore } from '../store/usePassStore'
import { PassCard } from '../components/PassCard'
import { MdAirplaneTicket } from 'react-icons/md'
import { UploadDialog } from '../components/UploadDialog'

export function Home() {
  const { passes } = usePassStore()

  useEffect(() => {
    document.title = 'Priority Pass'
  }, [])

  return (
    <div className="grid px-6 py-8 gap-8">
      <header>
        <h1 className="text-4xl font-normal mb-2">Passes</h1>
        <p className="text-muted-foreground">Manage your boarding passes</p>
      </header>

      {passes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="bg-muted p-6 rounded-full mb-6">
            <MdAirplaneTicket className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-normal mb-2">No passes yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Add a screenshot of your boarding pass with an Aztec barcode to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {passes.map((pass) => (
            <PassCard key={pass.id} pass={pass} />
          ))}
        </div>
      )}

      <UploadDialog />
    </div>
  )
}
