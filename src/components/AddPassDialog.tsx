import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { usePassStore, type BoardingPass } from '../store/usePassStore'
import { useNavigate } from 'react-router-dom'
import { MdAdd } from 'react-icons/md'
import { toast } from 'sonner'
import { processPassImage } from '../lib/passParser'
import { PassCropper } from './PassCropper'

export function AddPassDialog() {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [pendingPass, setPendingPass] = useState<BoardingPass | null>(null)
  const [boardingTime, setBoardingTime] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addPass = usePassStore((state) => state.addPass)
  const sharedFile = usePassStore((state) => state.sharedFile)
  const setSharedFile = usePassStore((state) => state.setSharedFile)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setImageSrc('')
        setIsProcessing(false)
        setPendingPass(null)
        setBoardingTime('')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  const onPassParsed = (parsedPass: BoardingPass) => {
    setPendingPass(parsedPass)
    const date = new Date(parsedPass.flightDate)
    const hours = String(date.getHours()).padStart(2, '0')
    const mins = String(date.getMinutes()).padStart(2, '0')
    setBoardingTime(`${hours}:${mins}`)
    setOpen(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)

    try {
      const parsedPass = await processPassImage(imageUrl)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onPassParsed(parsedPass)
    } catch {
      setImageSrc(imageUrl)
      setOpen(true)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  useEffect(() => {
    if (sharedFile) {
      const processShared = async () => {
        const imageUrl = URL.createObjectURL(sharedFile)

        try {
          const parsedPass = await processPassImage(imageUrl)
          onPassParsed(parsedPass)
          setSharedFile(null)
        } catch {
          setImageSrc(imageUrl)
          setOpen(true)
          setSharedFile(null)
        }
      }
      void processShared()
    }
  }, [sharedFile, setSharedFile])

  const handleConfirmCrop = async (croppedImageUrl: string) => {
    setIsProcessing(true)
    try {
      const parsedPass = await processPassImage(croppedImageUrl, imageSrc)
      onPassParsed(parsedPass)
    } catch (error) {
      console.error(error)
      toast.error('Failed to read barcode')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmTime = async () => {
    if (!pendingPass) return
    const [hours, mins] = boardingTime.split(':').map(Number)
    const newDate = new Date(pendingPass.flightDate)
    newDate.setHours(hours, mins, 0, 0)

    const finalPass = { ...pendingPass, flightDate: newDate }
    addPass(finalPass)
    setOpen(false)
    toast.success('Boarding pass added')
    if (document.startViewTransition) {
      document.startViewTransition({
        update: () => void navigate(`/pass/${finalPass.id}`),
        types: ['forward'],
      })
    } else {
      await navigate(`/pass/${finalPass.id}`)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 mx-auto w-full max-w-md pointer-events-none z-40 flex justify-end px-4">
        <Button
          className="pointer-events-auto shadow-lg h-14 px-6 gap-2 text-base cursor-pointer shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <MdAdd className="size-6" />
          Add pass
        </Button>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => void handleFileChange(e)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {pendingPass ? (
            <>
              <DialogHeader>
                <DialogTitle>Select boarding time</DialogTitle>
              </DialogHeader>
              <div className="p-4 flex-1 overflow-y-auto">
                <Label className="mb-2">Time</Label>
                <Input
                  type="time"
                  value={boardingTime}
                  onChange={(e) => setBoardingTime(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="flex-1 h-10">
                  Cancel
                </Button>
                <Button onClick={() => void handleConfirmTime()} className="flex-1 h-10">
                  Confirm
                </Button>
              </DialogFooter>
            </>
          ) : imageSrc ? (
            <PassCropper
              imageSrc={imageSrc}
              isProcessing={isProcessing}
              onConfirmCrop={(croppedUrl) => void handleConfirmCrop(croppedUrl)}
              onCancel={() => setOpen(false)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
