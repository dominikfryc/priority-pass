import { describe, it, expect } from 'vitest'
import { expandHex } from './expandHex'

describe('expandHex', () => {
  it('should expand a 3-character hex code', () => {
    expect(expandHex('#abc')).toBe('#aabbcc')
    expect(expandHex('#123')).toBe('#112233')
  })

  it('should leave a 6-character hex code unchanged', () => {
    expect(expandHex('#aabbcc')).toBe('#aabbcc')
    expect(expandHex('#123456')).toBe('#123456')
  })

  it('should use the default fallback if no hex is provided', () => {
    expect(expandHex(undefined)).toBe('#ffffff')
  })

  it('should use the provided fallback if no hex is provided', () => {
    expect(expandHex(undefined, '#000000')).toBe('#000000')
  })

  it('should not throw if a malformed non-hex string is provided, but just return it if it is not length 4', () => {
    expect(expandHex('green')).toBe('green')
  })
})
