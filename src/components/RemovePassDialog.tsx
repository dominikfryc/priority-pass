import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { usePassStore } from '../store/usePassStore'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'

export function RemovePassDialog({
  passId,
  open,
  onOpenChange,
}: {
  passId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const removePass = usePassStore((state) => state.removePass)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove boarding pass</DialogTitle>
        </DialogHeader>
        <div className="p-4 flex flex-col gap-4">
          <p className="text-muted-foreground">
            Are you sure you want to remove this boarding pass? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-10">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              removePass(passId)
              toast.success('Boarding pass removed')
              onOpenChange(false)
              if (document.startViewTransition) {
                document.startViewTransition({
                  update: () => void navigate('/'),
                  types: ['backward'],
                })
              } else {
                void navigate('/')
              }
            }}
            className="flex-1 h-10"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
