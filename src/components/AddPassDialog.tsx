import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { usePassStore, type BoardingPass } from '../store/usePassStore'
import { decode } from 'bcbp'
import { useNavigate } from 'react-router-dom'
import { MdAdd } from 'react-icons/md'
import { toast } from 'sonner'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Vibrant } from 'node-vibrant/browser'
import { expandHex } from '../lib/expandHex'
import { generateUUID, getLocalImageUrl } from '../lib/utils'
import { formatPassengerName } from '../lib/formatName'

export function AddPassDialog() {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [pendingPass, setPendingPass] = useState<BoardingPass | null>(null)
  const [boardingTime, setBoardingTime] = useState<string>('')
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addPass = usePassStore((state) => state.addPass)
  const sharedFile = usePassStore((state) => state.sharedFile)
  const setSharedFile = usePassStore((state) => state.setSharedFile)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setImageSrc('')
        setCrop(undefined)
        setCompletedCrop(undefined)
        setIsProcessing(false)
        setPendingPass(null)
        setBoardingTime('')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  const processPassImage = async (imageUrl: string, originalImageUrl?: string) => {
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
        fetch(`${import.meta.env.BASE_URL}airlines.json`),
        fetch(`${import.meta.env.BASE_URL}airports.json`),
      ])
      const airlines = (await airlinesRes.json()) as Record<
        string,
        { name: string; iata: string; icao?: string }
      >
      const airports = (await airportsRes.json()) as Record<string, string>

      let foundAirline = undefined
      if (leg?.operatingCarrierDesignator) {
        const designator = leg.operatingCarrierDesignator.trim()

        if (airlines[designator]) {
          foundAirline = airlines[designator]
        } else if (designator.length === 3) {
          const icaoToIata: Record<string, string> = {}
          for (const iataKey in airlines) {
            const icaoCode = airlines[iataKey].icao
            if (icaoCode && !icaoToIata[icaoCode]) {
              icaoToIata[icaoCode] = iataKey
            }
          }
          if (icaoToIata[designator]) {
            foundAirline = airlines[icaoToIata[designator]]
          }
        }
      }
      if (foundAirline) {
        airlineName = foundAirline.name || ''
        airlineLogoUrl = foundAirline.iata ? `/logos/${foundAirline.iata}.png` : ''
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
    let vibrantPallete = null

    if (airlineLogoUrl) {
      try {
        const targetLogoUrl = getLocalImageUrl(airlineLogoUrl)
        vibrantPallete = await Vibrant.from(targetLogoUrl).getPalette()
      } catch (err) {
        console.error('Failed to extract color from logo', err)
      }
    }

    const hasValidColors =
      vibrantPallete &&
      (vibrantPallete.DarkVibrant ||
        vibrantPallete.Vibrant ||
        vibrantPallete.Muted ||
        vibrantPallete.DarkMuted ||
        vibrantPallete.LightVibrant ||
        vibrantPallete.LightMuted)

    if (!hasValidColors) {
      const colorSourceUrl = originalImageUrl || imageUrl
      if (colorSourceUrl) {
        try {
          vibrantPallete = await Vibrant.from(colorSourceUrl).getPalette()
        } catch (err) {
          console.error('Failed to extract color from image', err)
        }
      }
    }

    if (vibrantPallete) {
      theme.backgroundColor = expandHex(vibrantPallete.DarkVibrant?.hex, '#ffffff')
      theme.foregroundColor = expandHex(vibrantPallete.DarkVibrant?.titleTextColor, '#000000')
      palette = [
        {
          backgroundColor: expandHex(vibrantPallete.DarkVibrant?.hex, '#ffffff'),
          foregroundColor: expandHex(vibrantPallete.DarkVibrant?.titleTextColor, '#000000'),
        },
        {
          backgroundColor: expandHex(vibrantPallete.Vibrant?.hex, '#ffffff'),
          foregroundColor: expandHex(vibrantPallete.Vibrant?.titleTextColor, '#000000'),
        },
        {
          backgroundColor: expandHex(vibrantPallete.LightVibrant?.hex, '#ffffff'),
          foregroundColor: expandHex(vibrantPallete.LightVibrant?.titleTextColor, '#000000'),
        },
        {
          backgroundColor: expandHex(vibrantPallete.Muted?.hex, '#ffffff'),
          foregroundColor: expandHex(vibrantPallete.Muted?.titleTextColor, '#000000'),
        },
        {
          backgroundColor: expandHex(vibrantPallete.DarkMuted?.hex, '#ffffff'),
          foregroundColor: expandHex(vibrantPallete.DarkMuted?.titleTextColor, '#000000'),
        },
        {
          backgroundColor: expandHex(vibrantPallete.LightMuted?.hex, '#ffffff'),
          foregroundColor: expandHex(vibrantPallete.LightMuted?.titleTextColor, '#000000'),
        },
      ]
    }

    const parsedPass = {
      id: generateUUID(),
      passengerName: formatPassengerName(decoded.data?.passengerName || ''),
      operatingCarrierPNR: leg?.operatingCarrierPNR || '',
      departureAirport: leg?.departureAirport || '',
      arrivalAirport: leg?.arrivalAirport || '',
      operatingCarrierDesignator: leg?.operatingCarrierDesignator || '',
      flightNumber: leg?.flightNumber || '',
      flightDate: leg?.flightDate || new Date(),
      seatNumber: (leg?.seatNumber || '').replace(/^0+/, ''),
      checkInSequenceNumber: (leg?.checkInSequenceNumber || '').replace(/^0+/, ''),
      airlineName,
      airlineLogoUrl,
      departureCity,
      arrivalCity,
      rawAztecData: text,
      theme,
      palette,
    }
    return parsedPass
  }

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
      setCrop(undefined)
      setCompletedCrop(undefined)
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
          setCrop(undefined)
          setCompletedCrop(undefined)
          setOpen(true)
          setSharedFile(null)
        }
      }
      void processShared()
    }
  }, [sharedFile, setSharedFile])

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
            <>
              <DialogHeader>
                <DialogTitle>Crop boarding pass</DialogTitle>
              </DialogHeader>
              <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center">
                <div className="w-fit max-w-full mx-auto flex justify-center items-center overflow-hidden rounded-lg [&_.ReactCrop__crop-mask]:hidden [&_.ReactCrop__crop-selection]:rounded-lg [&_.ReactCrop__crop-selection]:shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    className="h-fit max-h-[calc(100svh-13rem)]"
                  >
                    <img
                      ref={imageRef}
                      src={imageSrc}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      className="block mx-auto object-contain crop-preview-image"
                      style={{
                        width: 'auto',
                        height: 'auto',
                      }}
                    />
                  </ReactCrop>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    void handleConfirmCrop()
                  }}
                  disabled={isProcessing || !completedCrop?.width || !completedCrop?.height}
                  className="flex-1 h-10"
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
