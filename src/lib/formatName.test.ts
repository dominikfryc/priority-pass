import { describe, it, expect } from 'vitest'
import { formatPassengerName } from './formatName'

describe('formatPassengerName', () => {
  it('should format a standard LAST/FIRST name', () => {
    expect(formatPassengerName('DOE/JOHN')).toBe('John Doe')
  })

  it('should handle extra spaces', () => {
    expect(formatPassengerName('  SMITH / JANE  ')).toBe('Jane Smith')
  })

  it('should format names without a slash as capitalized', () => {
    expect(formatPassengerName('john doe')).toBe('John Doe')
  })

  it('should format a name with middle name', () => {
    expect(formatPassengerName('DOE/JOHN ROBERT')).toBe('John Robert Doe')
  })

  it('should return an empty string if undefined or empty is passed', () => {
    expect(formatPassengerName(undefined)).toBe('')
    expect(formatPassengerName('')).toBe('')
  })
})
