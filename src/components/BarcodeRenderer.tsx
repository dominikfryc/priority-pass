import { useEffect, useRef } from 'react'
import bwipjs from 'bwip-js/browser'

interface BarcodeRendererProps {
  data: string
  className?: string
}

export function BarcodeRenderer({ data, className = '' }: BarcodeRendererProps) {
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
    <div className={`flex justify-center p-[18px] bg-[#f2f2f2] rounded-[24px] ${className}`}>
      <canvas ref={canvasRef} className="max-w-full h-auto w-[180px]" />
    </div>
  )
}
