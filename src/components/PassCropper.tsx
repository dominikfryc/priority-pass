import { useState, useRef } from 'react'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button } from './ui/button'
import { DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import 'react-image-crop/dist/ReactCrop.css'

interface PassCropperProps {
  imageSrc: string
  isProcessing: boolean
  onConfirmCrop: (croppedImageUrl: string) => void
  onCancel: () => void
}

export function PassCropper({ imageSrc, isProcessing, onConfirmCrop, onCancel }: PassCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imageRef = useRef<HTMLImageElement>(null)

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

  const handleConfirmCrop = () => {
    if (!completedCrop || !imageRef.current) return

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
    onConfirmCrop(croppedImageUrl)
  }

  return (
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
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 h-10"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmCrop}
          disabled={isProcessing || !completedCrop?.width || !completedCrop?.height}
          className="flex-1 h-10"
        >
          {isProcessing ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogFooter>
    </>
  )
}
