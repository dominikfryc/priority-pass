import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, generateUUID, getLocalImageUrl } from './utils'

describe('utils.ts', () => {
  describe('cn', () => {
    it('merges multiple class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes properly', () => {
      const isTrue = true
      const isFalse = false
      expect(cn('class1', isTrue && 'class2', isFalse && 'class3')).toBe('class1 class2')
    })

    it('merges tailwind conflicts correctly using twMerge', () => {
      expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })
  })

  describe('generateUUID', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
      vi.restoreAllMocks()
    })

    it('uses crypto.randomUUID when available', () => {
      const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
      const mockRandomUUID = vi.fn().mockReturnValue(mockUUID)

      vi.stubGlobal('crypto', { randomUUID: mockRandomUUID })

      const id = generateUUID()
      expect(mockRandomUUID).toHaveBeenCalledTimes(1)
      expect(id).toBe(mockUUID)
    })

    it('falls back to Math.random when crypto.randomUUID is not available', () => {
      vi.stubGlobal('crypto', undefined)

      // Mock Math.random to return predictable values to verify the format
      const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

      const id = generateUUID()

      expect(mathRandomSpy).toHaveBeenCalled()
      // The format should look like xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })
  })

  describe('getLocalImageUrl', () => {
    beforeEach(() => {
      vi.stubEnv('BASE_URL', '/test-base/')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('returns empty string if url is undefined or empty', () => {
      expect(getLocalImageUrl(undefined)).toBe('')
      expect(getLocalImageUrl('')).toBe('')
    })

    it('prepends BASE_URL to absolute paths', () => {
      expect(getLocalImageUrl('/images/logo.png')).toBe('/test-base/images/logo.png')
    })

    it('returns the URL untouched if it does not start with a slash', () => {
      expect(getLocalImageUrl('http://example.com/logo.png')).toBe('http://example.com/logo.png')
      expect(getLocalImageUrl('data:image/png;base64,...')).toBe('data:image/png;base64,...')
      expect(getLocalImageUrl('images/logo.png')).toBe('images/logo.png')
    })
  })
})
