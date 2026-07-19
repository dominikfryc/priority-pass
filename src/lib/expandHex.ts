export const expandHex = (hex?: string, fallback = '#ffffff') => {
  const h = hex || fallback
  if (h.length === 4) {
    return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  }
  return h
}
