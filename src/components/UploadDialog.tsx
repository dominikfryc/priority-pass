import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { usePassStore } from '../store/usePassStore'
import { decode } from 'bcbp'
import { useNavigate } from 'react-router-dom'
import { MdAdd } from 'react-icons/md'
import { toast } from 'sonner'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Vibrant } from 'node-vibrant/browser'

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

  const processPassImage = async (imageUrl: string) => {
    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.AZTEC,
      BarcodeFormat.PDF_417,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
    ])
    const reader = new BrowserMultiFormatReader(hints)
    const img = new Image()

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    const result = await reader.decodeFromImageElement(img)
    const text = result.getText()
    const decoded = decode(text)
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
      const airlines = (await airlinesRes.json()) as Record<string, { name: string; logo: string }>
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

    const theme = {
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
    }
    let palette = [] as {
      backgroundColor: string
      foregroundColor: string
    }[]
    if (airlineLogoUrl) {
      try {
        const proxiedUrl = airlineLogoUrl
          .replace('https://images.kiwi.com', '/kiwi-images')
          .replace('/airlines/64/', '/airlines/64x64/')
        const vibrantPallete = await Vibrant.from(proxiedUrl).getPalette()
        theme.backgroundColor = vibrantPallete.DarkVibrant?.hex || '#ffffff'
        theme.foregroundColor = vibrantPallete.DarkVibrant?.titleTextColor || '#000000'
        palette = [
          {
            backgroundColor: vibrantPallete.DarkVibrant?.hex || '#ffffff',
            foregroundColor: vibrantPallete.DarkVibrant?.titleTextColor || '#000000',
          },
          {
            backgroundColor: vibrantPallete.Vibrant?.hex || '#ffffff',
            foregroundColor: vibrantPallete.Vibrant?.titleTextColor || '#000000',
          },
          {
            backgroundColor: vibrantPallete.LightVibrant?.hex || '#ffffff',
            foregroundColor: vibrantPallete.LightVibrant?.titleTextColor || '#000000',
          },
          {
            backgroundColor: vibrantPallete.Muted?.hex || '#ffffff',
            foregroundColor: vibrantPallete.Muted?.titleTextColor || '#000000',
          },
          {
            backgroundColor: vibrantPallete.DarkMuted?.hex || '#ffffff',
            foregroundColor: vibrantPallete.DarkMuted?.titleTextColor || '#000000',
          },
          {
            backgroundColor: vibrantPallete.LightMuted?.hex || '#ffffff',
            foregroundColor: vibrantPallete.LightMuted?.titleTextColor || '#000000',
          },
        ]
      } catch (err) {
        console.error('Failed to extract color from logo', err)
      }
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
      theme,
      palette,
    }
    console.log('Parsed boarding pass:', parsedPass)

    addPass(parsedPass)
    return parsedPass
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const imageUrl = URL.createObjectURL(file)
    const toastId = toast.loading('Scanning image...')

    try {
      const parsedPass = await processPassImage(imageUrl)
      toast.dismiss(toastId)
      toast.success('Boarding pass added successfully')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await navigate(`/pass/${parsedPass.id}`)
    } catch {
      toast.dismiss(toastId)
      setImageSrc(imageUrl)
      setCrop(undefined)
      setCompletedCrop(undefined)
      setOpen(true)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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

      const parsedPass = await processPassImage(croppedImageUrl)

      setOpen(false)
      setImageSrc('')
      toast.success('Boarding pass added successfully')
      await navigate(`/pass/${parsedPass.id}`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to read barcode')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-8 left-0 right-0 pointer-events-none flex justify-center z-40">
        <div className="w-full max-w-md relative h-14">
          <button
            className="pointer-events-auto absolute right-6 bottom-0 inline-flex items-center justify-center whitespace-nowrap rounded-full shadow-lg h-14 px-6 gap-2 text-base font-medium bg-primary text-primary-foreground cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <MdAdd className="w-6 h-6" />
            Add Pass
          </button>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => void handleFileChange(e)}
      />
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
        <DialogContent
          className="transition-all duration-200 w-fit sm:max-w-none p-4"
          style={{
            maxHeight: 'calc(100vh - 5rem)',
            maxWidth: 'fit-content',
            minWidth: 'max-content',
          }}
        >
          <DialogHeader>
            <DialogTitle>Crop Boarding Pass</DialogTitle>
          </DialogHeader>
          {imageSrc && (
            <>
              <div className="w-fit max-w-full mx-auto flex justify-center items-center overflow-hidden rounded-lg [&_.ReactCrop__crop-mask]:hidden [&_.ReactCrop__crop-selection]:rounded-lg [&_.ReactCrop__crop-selection]:shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] mt-4">
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
              <div className="flex gap-2 w-full shrink-0 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
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
    </>
  )
}
