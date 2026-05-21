import { usePassStore } from '../store/usePassStore'
import { PassCard } from '../components/PassCard'
import { Ticket } from 'lucide-react'
import { UploadDialog } from '../components/UploadDialog'

export function Home() {
  const { passes } = usePassStore()

  return (
    <div className="min-h-screen bg-background p-5 md:p-8 max-w-5xl mx-auto pb-28">
      <header className="mb-8 mt-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight">Passes</h1>
        <p className="text-muted-foreground mt-2">Manage your boarding passes locally</p>
      </header>

      {passes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-in fade-in duration-500">
          <div className="bg-muted p-6 rounded-full mb-6">
            <Ticket className="w-12 h-12 text-muted-foreground opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No passes yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Add a screenshot of your boarding pass with an Aztec barcode to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {passes.map((pass) => (
            <PassCard key={pass.id} pass={pass} />
          ))}
        </div>
      )}

      <UploadDialog />
    </div>
  )
}
