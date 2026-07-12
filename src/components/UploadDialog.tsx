import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { BrowserAztecCodeReader } from '@zxing/browser'
import { usePassStore } from '../store/usePassStore'
import { decode } from 'bcbp'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdImage } from 'react-icons/md'
import { toast } from 'sonner'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export function UploadDialog() {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addPass } = usePassStore()
  const navigate = useNavigate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    setImageSrc(imageUrl)
    setCrop(undefined)
    setCompletedCrop(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1,
        naturalWidth,
        naturalHeight,
      ),
      naturalWidth,
      naturalHeight,
    )
    setCrop(initialCrop)
  }

  const handleConfirmCrop = async () => {
    if (!completedCrop || !imageRef.current) return

    setIsProcessing(true)
    try {
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height

      const canvas = document.createElement('canvas')
      canvas.width = completedCrop.width * scaleX
      canvas.height = completedCrop.height * scaleY

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('No 2d context')
      }

      ctx.drawImage(
        imageRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
      )

      const croppedImageUrl = canvas.toDataURL('image/jpeg')

      const reader = new BrowserAztecCodeReader()
      const img = new Image()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = croppedImageUrl
      })

      const result = await reader.decodeFromImageElement(img)
      const text = result.getText()
      const decoded = decode(text)
      const hue = Math.floor(Math.random() * 360)
      const leg = decoded.data?.legs?.[0]

      let airlineName = ''
      let airlineLogoUrl = ''
      let departureCity = ''
      let arrivalCity = ''

      try {
        const [airlinesRes, airportsRes] = await Promise.all([
          fetch('/airlines.json'),
          fetch('/airports.json'),
        ])
        const airlines = (await airlinesRes.json()) as Record<
          string,
          { name: string; logo: string }
        >
        const airports = (await airportsRes.json()) as Record<string, string>

        const foundAirline = leg?.operatingCarrierDesignator
          ? airlines[leg.operatingCarrierDesignator]
          : undefined
        if (foundAirline) {
          airlineName = foundAirline.name || ''
          airlineLogoUrl = foundAirline.logo || ''
        }

        if (leg?.departureAirport) {
          departureCity = airports[leg.departureAirport] || ''
        }
        if (leg?.arrivalAirport) {
          arrivalCity = airports[leg.arrivalAirport] || ''
        }
      } catch (error) {
        console.error('Failed to fetch airlines or airports data', error)
      }

      const parsedPass = {
        id: crypto.randomUUID(),
        passengerName: decoded.data?.passengerName || '',
        operatingCarrierPNR: leg?.operatingCarrierPNR || '',
        departureAirport: leg?.departureAirport || '',
        arrivalAirport: leg?.arrivalAirport || '',
        operatingCarrierDesignator: leg?.operatingCarrierDesignator || '',
        flightNumber: leg?.flightNumber || '',
        flightDate: leg?.flightDate || new Date(),
        seatNumber: leg?.seatNumber || '',
        checkInSequenceNumber: leg?.checkInSequenceNumber || '',
        airlineName,
        airlineLogoUrl,
        departureCity,
        arrivalCity,
        rawAztecData: text,
        themeColor: `hsl(${hue}, 70%, 50%)`,
      }
      console.log('Parsed boarding pass:', parsedPass)

      addPass(parsedPass)
      setOpen(false)
      setImageSrc('')
      toast.success('Boarding pass added successfully!')
      await navigate(`/pass/${parsedPass.id}`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to read Aztec code. Please make sure the image is clear and cropped.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) {
          setImageSrc('')
          setCrop(undefined)
          setCompletedCrop(undefined)
          setIsProcessing(false)
        }
      }}
    >
      <div className="fixed bottom-8 left-0 right-0 pointer-events-none flex justify-center z-40">
        <div className="w-full max-w-md relative h-14">
          <DialogTrigger className="pointer-events-auto absolute right-6 bottom-0 inline-flex items-center justify-center whitespace-nowrap rounded-full shadow-lg h-14 px-6 gap-2 text-base font-medium bg-primary text-primary-foreground cursor-pointer">
            <MdAdd className="w-6 h-6" />
            Add Pass
          </DialogTrigger>
        </div>
      </div>
      <DialogContent
        className={`transition-all duration-200 ${imageSrc ? 'w-fit sm:max-w-none p-4' : 'sm:max-w-md'}`}
        style={
          imageSrc
            ? {
                maxHeight: 'calc(100vh - 5rem)',
                maxWidth: 'fit-content',
                minWidth: 'max-content',
              }
            : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>Upload Boarding Pass</DialogTitle>
        </DialogHeader>
        {!imageSrc ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-muted/30 mt-4 transition-colors hover:bg-muted/50">
            <MdImage className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm text-center text-muted-foreground mb-6">
              Upload a screenshot of your boarding pass containing the Aztec barcode.
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              Select Screenshot
            </Button>
          </div>
        ) : (
          <>
            <div className="w-fit max-w-full mx-auto flex justify-center items-center overflow-hidden rounded-lg [&_.ReactCrop__crop-mask]:hidden [&_.ReactCrop__crop-selection]:rounded-lg [&_.ReactCrop__crop-selection]:shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                className="h-fit"
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="block mx-auto object-contain crop-preview-image"
                  style={{
                    maxHeight: 'calc(100vh - 15rem)',
                    width: 'auto',
                    height: 'auto',
                  }}
                />
              </ReactCrop>
            </div>
            <div className="flex gap-2 w-full shrink-0">
              <Button
                variant="outline"
                onClick={() => setImageSrc('')}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  void handleConfirmCrop()
                }}
                disabled={isProcessing || !completedCrop?.width || !completedCrop?.height}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Confirm Crop'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
