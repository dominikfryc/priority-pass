import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PassDetail } from './PassDetail'
import * as usePassStoreModule from '../store/usePassStore'

// Mock sub-components so they don't interfere
vi.mock('../components/FullPassCard', () => ({
  FullPassCard: ({ pass }: { pass: { id: string } }) => (
    <div data-testid="full-pass-card">{pass.id}</div>
  ),
}))
vi.mock('../components/EditPassDialog', () => ({
  EditPassDialog: () => <div data-testid="edit-pass-dialog" />,
}))
vi.mock('../components/RemovePassDialog', () => ({
  RemovePassDialog: () => <div data-testid="remove-pass-dialog" />,
}))

describe('PassDetail Page', () => {
  it('renders "Pass not found" when the pass ID does not exist', () => {
    vi.spyOn(usePassStoreModule, 'usePassStore').mockReturnValue({ passes: [] })

    render(
      <MemoryRouter initialEntries={['/pass/999']}>
        <Routes>
          <Route path="/pass/:id" element={<PassDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Pass not found')).toBeInTheDocument()
  })

  it('renders the FullPassCard when the pass is found', () => {
    const mockPass = { id: '123', departureAirport: 'JFK', arrivalAirport: 'LHR' }
    vi.spyOn(usePassStoreModule, 'usePassStore').mockReturnValue({ passes: [mockPass] })

    render(
      <MemoryRouter initialEntries={['/pass/123']}>
        <Routes>
          <Route path="/pass/:id" element={<PassDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    // It should render the mocked FullPassCard containing the ID
    expect(screen.getByTestId('full-pass-card')).toHaveTextContent('123')
    // "Pass not found" should NOT be there
    expect(screen.queryByText('Pass not found')).not.toBeInTheDocument()
  })
})
