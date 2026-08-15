import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BarcodeRenderer } from './BarcodeRenderer'
import bwipjs from 'bwip-js/browser'

// Mock the bwipjs library since canvas drawing won't work perfectly in jsdom
vi.mock('bwip-js/browser', () => ({
  default: {
    toCanvas: vi.fn(),
  },
}))

describe('BarcodeRenderer Component', () => {
  it('renders a canvas element', () => {
    const { container } = render(<BarcodeRenderer data="test-data" />)
    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
  })

  it('calls bwipjs.toCanvas with the correct data on mount', () => {
    render(<BarcodeRenderer data="my-secret-barcode" />)

    expect(bwipjs.toCanvas).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      expect.objectContaining({
        bcid: 'azteccode',
        text: 'my-secret-barcode',
      }),
    )
  })
})
