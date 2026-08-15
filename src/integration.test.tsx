import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { PassDetail } from './pages/PassDetail'
import { usePassStore, type BoardingPass } from './store/usePassStore'

// We do NOT mock the store here! We want to test the real integration between the UI and Zustand.

// We will mock the indexedDb utility just so it doesn't try to access real indexedDB on mount
vi.mock('./lib/indexedDbUtils', () => ({
  getLatestSharedImage: vi.fn().mockResolvedValue(undefined),
}))

// We mock processPassImage so the Add Pass flow bypasses the actual ZXing barcode scanner
vi.mock('./lib/passParser', () => ({
  processPassImage: vi.fn(),
}))

// We mock BarcodeRenderer because JSDOM doesn't support the Canvas API needed by bwip-js
vi.mock('./components/BarcodeRenderer', () => ({
  BarcodeRenderer: () => <div data-testid="mock-barcode-renderer">Barcode</div>,
}))

describe('App Integration', () => {
  beforeEach(() => {
    // Reset the Zustand store before each test
    usePassStore.setState({ passes: [], sharedFile: null })
  })

  const samplePass: BoardingPass = {
    id: 'integration-pass-1',
    passengerName: 'Integration Tester',
    departureAirport: 'SFO',
    arrivalAirport: 'JFK',
    operatingCarrierDesignator: 'UA',
    flightNumber: '999',
    flightDate: new Date('2025-01-01T10:00:00Z'),
    seatNumber: '1A',
    checkInSequenceNumber: '001',
    operatingCarrierPNR: 'ABCDEF',
    airlineName: 'Test Airlines',
    airlineLogoUrl: '',
    departureCity: 'San Francisco',
    arrivalCity: 'New York',
    rawAztecData: 'rawdata',
    theme: { backgroundColor: '#000000', foregroundColor: '#ffffff' },
    palette: [],
  }

  it('allows a user to add a new pass', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pass/:id" element={<PassDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    // 1. We are on Home, no passes yet
    expect(screen.getByText('No passes yet')).toBeInTheDocument()

    // 2. We mock the processPassImage parser since we are bypassing the barcode scanner
    const { processPassImage } = await import('./lib/passParser')
    vi.mocked(processPassImage).mockResolvedValue(samplePass)

    // 3. Simulate file upload by finding the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['dummy content'], 'boarding-pass.png', { type: 'image/png' })
    await user.upload(fileInput, file)

    // 4. The time selection dialog should open
    const dialogTitle = await screen.findByText('Select boarding time')
    expect(dialogTitle).toBeInTheDocument()

    // 5. Click confirm on the time dialog
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    await user.click(confirmButton)

    // 6. We should be navigated to the PassDetail view of the newly added pass
    // The PassDetail should show "San Francisco to New York"
    expect(await screen.findByText('San Francisco to New York')).toBeInTheDocument()

    // 7. Verify the real store has the pass
    expect(usePassStore.getState().passes).toHaveLength(1)
    expect(usePassStore.getState().passes[0].passengerName).toBe('Integration Tester')
  })

  it('allows a user to view a pass', async () => {
    const user = userEvent.setup()

    // 1. Seed the real store with one pass
    usePassStore.setState({ passes: [samplePass] })

    // 2. Render both routes in a MemoryRouter
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pass/:id" element={<PassDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    // 3. Verify we are on Home and the pass is rendered
    expect(screen.getByText('Integration Tester, Jan 1')).toBeInTheDocument()

    // 4. Click the pass card to navigate to PassDetail
    const passLink = screen.getByRole('link', { name: /Integration Tester/i })
    await user.click(passLink)

    // 5. Verify we navigated to PassDetail correctly
    expect(await screen.findByText('San Francisco to New York')).toBeInTheDocument()
    expect(screen.getByText('SFO')).toBeInTheDocument()
    expect(screen.getByText('JFK')).toBeInTheDocument()
  })

  it('allows a user to edit an existing pass', async () => {
    const user = userEvent.setup()

    usePassStore.setState({ passes: [samplePass] })

    render(
      <MemoryRouter initialEntries={[`/pass/${samplePass.id}`]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pass/:id" element={<PassDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    // 1. Verify we are on PassDetail
    expect(await screen.findByText('San Francisco to New York')).toBeInTheDocument()
    expect(screen.getByText('Integration Tester')).toBeInTheDocument()

    // 2. Open the dropdown menu
    const menuTrigger = screen.getByRole('button', { name: /Open menu/i })
    await user.click(menuTrigger)

    // 3. Click the "Edit pass" menu item
    const editMenuItem = await screen.findByRole('menuitem', { name: /Edit pass/i })
    await user.click(editMenuItem)

    // 4. The EditPassDialog should open
    const dialogTitle = await screen.findByText('Edit boarding pass')
    expect(dialogTitle).toBeInTheDocument()

    // 5. Find the Passenger Name input and change it
    const nameInput = screen.getByDisplayValue('Integration Tester')
    await user.clear(nameInput)
    await user.type(nameInput, 'New Name Jane')

    // 6. Click Save
    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    await user.click(saveButton)

    // 7. The dialog closes and the PassDetail reflects the new name
    expect(await screen.findByText('New Name Jane')).toBeInTheDocument()

    // 8. Verify the real store was updated
    expect(usePassStore.getState().passes[0].passengerName).toBe('New Name Jane')
  })

  it('allows a user to delete a pass', async () => {
    const user = userEvent.setup()

    // 1. Seed the real store with one pass
    usePassStore.setState({ passes: [samplePass] })

    // 2. Render starting directly on the PassDetail route
    render(
      <MemoryRouter initialEntries={[`/pass/${samplePass.id}`]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pass/:id" element={<PassDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    // 3. Verify we are on PassDetail
    expect(await screen.findByText('San Francisco to New York')).toBeInTheDocument()

    // 4. Open the dropdown menu
    const menuTrigger = screen.getByRole('button', { name: /Open menu/i })
    await user.click(menuTrigger)

    // 5. Click the "Remove pass" menu item
    const removeMenuItem = await screen.findByRole('menuitem', { name: /Remove pass/i })
    await user.click(removeMenuItem)

    // 6. The RemovePassDialog should now be visible
    const dialogTitle = await screen.findByText('Remove boarding pass')
    expect(dialogTitle).toBeInTheDocument()

    // 7. Click the confirm "Remove" button in the dialog
    const confirmRemoveButton = screen.getByRole('button', { name: 'Remove' })
    await user.click(confirmRemoveButton)

    // 8. The store removes the pass, and RemovePassDialog navigates back to '/'
    expect(await screen.findByText('No passes yet')).toBeInTheDocument()

    // 9. Verify it's gone from the real store
    expect(usePassStore.getState().passes.length).toBe(0)
  })
})
