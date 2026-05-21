import { useEffect, useRef } from 'react'
import bwipjs from 'bwip-js/browser'

interface BarcodeRendererProps {
  data: string
}

export function BarcodeRenderer({ data }: BarcodeRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: 'azteccode',
          text: data,
          scale: 4,
          includetext: false,
        })
      } catch (e) {
        console.error('Barcode rendering failed', e)
      }
    }
  }, [data])

  return (
    <div className="flex justify-center p-4 bg-white rounded-xl shadow-sm">
      <canvas ref={canvasRef} className="max-w-full h-auto" />
    </div>
  )
}
