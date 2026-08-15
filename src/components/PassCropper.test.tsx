import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PassCropper } from './PassCropper'
import userEvent from '@testing-library/user-event'

// Mock the ReactCrop library to avoid complex DOM measurements in jsdom
vi.mock('react-image-crop', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as object),
    default: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-react-crop">{children}</div>
    ),
  }
})

// Mock the dialog components so they don't require context
vi.mock('./ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('PassCropper Component', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  it('renders the crop preview image and buttons', () => {
    render(
      <PassCropper
        imageSrc="test-image.jpg"
        isProcessing={false}
        onConfirmCrop={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    )

    // Should render the title
    expect(screen.getByText('Crop boarding pass')).toBeInTheDocument()

    // Should render the mocked crop container
    expect(screen.getByTestId('mock-react-crop')).toBeInTheDocument()

    // Should render the image with the correct src
    const img = screen.getByAltText('Crop preview')
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('src')).toContain('test-image.jpg')

    // Should render buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(
      <PassCropper
        imageSrc="test-image.jpg"
        isProcessing={false}
        onConfirmCrop={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    )

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelBtn)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('disables buttons when processing', () => {
    render(
      <PassCropper
        imageSrc="test-image.jpg"
        isProcessing={true}
        onConfirmCrop={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
    )

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    const confirmBtn = screen.getByRole('button', { name: /processing.../i })

    expect(cancelBtn).toBeDisabled()
    expect(confirmBtn).toBeDisabled()
  })
})
