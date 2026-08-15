import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getLatestSharedImage } from './indexedDbUtils'

describe('indexedDbUtils - getLatestSharedImage', () => {
  let mockDelete: ReturnType<typeof vi.fn>
  let mockGet: ReturnType<typeof vi.fn>
  let mockObjectStore: ReturnType<typeof vi.fn>
  let mockTransaction: ReturnType<typeof vi.fn>

  interface MockRequest {
    result?: unknown
    error?: Error
    onsuccess?: (e?: { target: unknown }) => void
    onerror?: () => void
  }

  beforeEach(() => {
    mockDelete = vi.fn()
    mockGet = vi.fn()
    mockObjectStore = vi.fn().mockReturnValue({
      get: mockGet,
      delete: mockDelete,
    })
    mockTransaction = vi.fn().mockReturnValue({
      objectStore: mockObjectStore,
    })

    const mockDB = {
      transaction: mockTransaction,
    }

    // Mock indexedDB.open
    const mockOpen = vi.fn().mockImplementation(() => {
      const request: MockRequest = {}
      setTimeout(() => {
        request.result = mockDB
        if (request.onsuccess) {
          request.onsuccess({ target: request })
        }
      }, 0)
      return request
    })

    vi.stubGlobal('indexedDB', { open: mockOpen })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('retrieves the file and deletes it from the store', async () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' })

    // When store.get is called, simulate successful retrieval
    mockGet.mockImplementation(() => {
      const req: MockRequest = { result: mockFile }
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess()
      }, 0)
      return req
    })

    const result = await getLatestSharedImage()

    expect(result).toBe(mockFile)
    expect(mockTransaction).toHaveBeenCalledWith('shared-files', 'readwrite')
    expect(mockObjectStore).toHaveBeenCalledWith('shared-files')
    expect(mockGet).toHaveBeenCalledWith('latest-shared-image')
    expect(mockDelete).toHaveBeenCalledWith('latest-shared-image')
  })

  it('returns undefined if no file is found', async () => {
    mockGet.mockImplementation(() => {
      const req: MockRequest = { result: undefined }
      setTimeout(() => {
        if (req.onsuccess) req.onsuccess()
      }, 0)
      return req
    })

    const result = await getLatestSharedImage()

    expect(result).toBeUndefined()
    expect(mockDelete).toHaveBeenCalledWith('latest-shared-image')
  })

  it('returns undefined and logs error if indexedDB open fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.stubGlobal('indexedDB', {
      open: vi.fn().mockImplementation(() => {
        const request: MockRequest = { error: new Error('DB Open Error') }
        setTimeout(() => {
          if (request.onerror) request.onerror()
        }, 0)
        return request
      }),
    })

    const result = await getLatestSharedImage()

    expect(result).toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading shared file from IndexedDB:',
      expect.any(Error),
    )
    consoleSpy.mockRestore()
  })

  it('returns undefined and logs error if store.get fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockGet.mockImplementation(() => {
      const req: MockRequest = { error: new Error('Get Error') }
      setTimeout(() => {
        if (req.onerror) req.onerror()
      }, 0)
      return req
    })

    const result = await getLatestSharedImage()

    expect(result).toBeUndefined()
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading shared file from IndexedDB:',
      expect.any(Error),
    )
    consoleSpy.mockRestore()
  })
})
