import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { usePassStore, type BoardingPass } from '../store/usePassStore'
import { toast } from 'sonner'

interface EditPassDialogProps {
  pass: BoardingPass
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPassDialog({ pass, open, onOpenChange }: EditPassDialogProps) {
  const updatePass = usePassStore((state) => state.updatePass)
  const [formData, setFormData] = useState<BoardingPass>(pass)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData(pass)
    }
    onOpenChange(newOpen)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, flightDate: new Date(e.target.value) }))
  }

  const handleThemeChange = (field: 'backgroundColor' | 'foregroundColor', value: string) => {
    setFormData((prev) => ({
      ...prev,
      theme: { ...prev.theme, [field]: value },
    }))
  }

  const handlePaletteClick = (color: { backgroundColor: string; foregroundColor: string }) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        backgroundColor: color.backgroundColor,
        foregroundColor: color.foregroundColor,
      },
    }))
  }

  const handleSave = () => {
    updatePass(pass.id, formData)
    toast.success('Boarding pass updated')
    onOpenChange(false)
  }

  // Format date for datetime-local input
  const dateObj = new Date(formData.flightDate)
  const localIsoString = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit boarding pass</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2">Departure Airport</Label>
              <Input
                name="departureAirport"
                value={formData.departureAirport}
                onChange={handleChange}
                maxLength={3}
              />
            </div>
            <div>
              <Label className="mb-2">Arrival Airport</Label>
              <Input
                name="arrivalAirport"
                value={formData.arrivalAirport}
                onChange={handleChange}
                maxLength={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2">Departure City</Label>
              <Input name="departureCity" value={formData.departureCity} onChange={handleChange} />
            </div>
            <div>
              <Label className="mb-2">Arrival City</Label>
              <Input name="arrivalCity" value={formData.arrivalCity} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label className="mb-2">Passenger Name</Label>
            <Input name="passengerName" value={formData.passengerName} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2">Airline Name</Label>
              <Input name="airlineName" value={formData.airlineName} onChange={handleChange} />
            </div>
            <div>
              <Label className="mb-2">Flight Number</Label>
              <Input name="flightNumber" value={formData.flightNumber} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label className="mb-2">Flight Date & Time</Label>
            <Input type="datetime-local" value={localIsoString} onChange={handleDateChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2">Seat</Label>
              <Input name="seatNumber" value={formData.seatNumber} onChange={handleChange} />
            </div>
            <div>
              <Label className="mb-2">Sequence</Label>
              <Input
                name="checkInSequenceNumber"
                value={formData.checkInSequenceNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="mb-2">Background Color</Label>
                <div className="relative w-full h-10">
                  <Input
                    type="color"
                    value={formData.theme.backgroundColor}
                    onChange={(e) => handleThemeChange('backgroundColor', e.target.value)}
                    className="peer w-full h-full p-0 border-none! ring-0! cursor-pointer overflow-hidden appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:border-none"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl border border-input peer-focus-visible:border-white peer-focus-visible:ring-1 peer-focus-visible:ring-inset peer-focus-visible:ring-white" />
                </div>
              </div>
              <div>
                <Label className="mb-2">Text Color</Label>
                <div className="relative w-full h-10">
                  <Input
                    type="color"
                    value={formData.theme.foregroundColor}
                    onChange={(e) => handleThemeChange('foregroundColor', e.target.value)}
                    className="peer w-full h-full p-0 border-none! ring-0! cursor-pointer overflow-hidden appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:border-none"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl border border-input peer-focus-visible:border-white peer-focus-visible:ring-1 peer-focus-visible:ring-inset peer-focus-visible:ring-white" />
                </div>
              </div>
            </div>

            {formData.palette && formData.palette.length > 0 && (
              <div>
                <Label className="mb-2 block">Color Palette</Label>
                <div className="flex w-full justify-between gap-2">
                  {formData.palette.map((color) => (
                    <button
                      key={`${color.backgroundColor}-${color.foregroundColor}`}
                      className={`flex-1 aspect-square max-h-12 max-w-12 rounded-full border shadow-sm flex items-center justify-center transition-transform hover:scale-110 focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        formData.theme.backgroundColor === color.backgroundColor
                          ? 'border-transparent ring-2 ring-white'
                          : 'border-input'
                      }`}
                      style={{
                        backgroundColor: color.backgroundColor,
                        color: color.foregroundColor,
                      }}
                      onClick={() => handlePaletteClick(color)}
                      title={`BG: ${color.backgroundColor}\nFG: ${color.foregroundColor}`}
                    >
                      <span className="font-bold text-lg leading-none">A</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="flex-1 h-10" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1 h-10" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
