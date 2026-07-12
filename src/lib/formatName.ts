export function formatPassengerName(name: string | undefined): string {
  if (!name) return ''
  const parts = name.split('/')

  const capitalize = (s: string) => {
    return s
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (parts.length === 2) {
    const lastName = parts[0].trim()
    const firstName = parts[1].trim()
    return `${capitalize(firstName)} ${capitalize(lastName)}`
  }

  return capitalize(name)
}
