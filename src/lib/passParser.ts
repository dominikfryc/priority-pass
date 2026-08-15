import { decode } from 'bcbp'
import { z } from 'zod'
import { toast } from 'sonner'
import type { BoardingPass } from '../store/usePassStore'
import { expandHex } from './expandHex'
import { generateUUID, getLocalImageUrl } from './utils'
import { formatPassengerName } from './formatName'

const airlinesSchema = z.record(
  z.string(),
  z.object({
    name: z.string().default(''),
    iata: z.string().default(''),
    icao: z.string().optional(),
  }),
)

const airportsSchema = z.record(z.string(), z.string())

export const processPassImage = async (
  imageUrl: string,
  originalImageUrl?: string,
): Promise<BoardingPass> => {
  const { BrowserMultiFormatReader } = await import('@zxing/browser')
  const { BarcodeFormat, DecodeHintType } = await import('@zxing/library')

  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.AZTEC,
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
  ])
  const reader = new BrowserMultiFormatReader(hints)
  const img = new Image()

  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = imageUrl
  })

  const result = await reader.decodeFromImageElement(img)
  const text = result.getText()
  const decoded = decode(text)
  const leg = decoded.data?.legs?.[0]

  let airlineName = ''
  let airlineLogoUrl = ''
  let departureCity = ''
  let arrivalCity = ''

  try {
    const [airlinesRes, airportsRes] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}airlines.json`),
      fetch(`${import.meta.env.BASE_URL}airports.json`),
    ])
    const airlines = airlinesSchema.parse(await airlinesRes.json())
    const airports = airportsSchema.parse(await airportsRes.json())

    let foundAirline = undefined
    if (leg?.operatingCarrierDesignator) {
      const designator = leg.operatingCarrierDesignator.trim()

      if (airlines[designator]) {
        foundAirline = airlines[designator]
      } else if (designator.length === 3) {
        const icaoToIata: Record<string, string> = {}
        for (const iataKey in airlines) {
          const icaoCode = airlines[iataKey].icao
          if (icaoCode && !icaoToIata[icaoCode]) {
            icaoToIata[icaoCode] = iataKey
          }
        }
        if (icaoToIata[designator]) {
          foundAirline = airlines[icaoToIata[designator]]
        }
      }
    }
    if (foundAirline) {
      airlineName = foundAirline.name || ''
      airlineLogoUrl = foundAirline.iata ? `/logos/${foundAirline.iata}.png` : ''
    }

    if (leg?.departureAirport) {
      departureCity = airports[leg.departureAirport] || ''
    }
    if (leg?.arrivalAirport) {
      arrivalCity = airports[leg.arrivalAirport] || ''
    }
  } catch (error) {
    console.error('Failed to fetch airlines or airports data', error)
    toast.error('Failed to load airline and airport data. Some details may be missing.')
  }

  const theme = {
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
  }
  let palette = [] as {
    backgroundColor: string
    foregroundColor: string
  }[]
  let vibrantPallete = null

  if (airlineLogoUrl) {
    try {
      const { Vibrant } = await import('node-vibrant/browser')
      const targetLogoUrl = getLocalImageUrl(airlineLogoUrl)
      vibrantPallete = await Vibrant.from(targetLogoUrl).getPalette()
    } catch (err) {
      console.error('Failed to extract color from logo', err)
    }
  }

  const hasValidColors =
    vibrantPallete &&
    (vibrantPallete.DarkVibrant ||
      vibrantPallete.Vibrant ||
      vibrantPallete.Muted ||
      vibrantPallete.DarkMuted ||
      vibrantPallete.LightVibrant ||
      vibrantPallete.LightMuted)

  if (!hasValidColors) {
    const colorSourceUrl = originalImageUrl || imageUrl
    if (colorSourceUrl) {
      try {
        const { Vibrant } = await import('node-vibrant/browser')
        vibrantPallete = await Vibrant.from(colorSourceUrl).getPalette()
      } catch (err) {
        console.error('Failed to extract color from image', err)
      }
    }
  }

  if (vibrantPallete) {
    theme.backgroundColor = expandHex(vibrantPallete.DarkVibrant?.hex, '#ffffff')
    theme.foregroundColor = expandHex(vibrantPallete.DarkVibrant?.titleTextColor, '#000000')
    palette = [
      {
        backgroundColor: expandHex(vibrantPallete.DarkVibrant?.hex, '#ffffff'),
        foregroundColor: expandHex(vibrantPallete.DarkVibrant?.titleTextColor, '#000000'),
      },
      {
        backgroundColor: expandHex(vibrantPallete.Vibrant?.hex, '#ffffff'),
        foregroundColor: expandHex(vibrantPallete.Vibrant?.titleTextColor, '#000000'),
      },
      {
        backgroundColor: expandHex(vibrantPallete.LightVibrant?.hex, '#ffffff'),
        foregroundColor: expandHex(vibrantPallete.LightVibrant?.titleTextColor, '#000000'),
      },
      {
        backgroundColor: expandHex(vibrantPallete.Muted?.hex, '#ffffff'),
        foregroundColor: expandHex(vibrantPallete.Muted?.titleTextColor, '#000000'),
      },
      {
        backgroundColor: expandHex(vibrantPallete.DarkMuted?.hex, '#ffffff'),
        foregroundColor: expandHex(vibrantPallete.DarkMuted?.titleTextColor, '#000000'),
      },
      {
        backgroundColor: expandHex(vibrantPallete.LightMuted?.hex, '#ffffff'),
        foregroundColor: expandHex(vibrantPallete.LightMuted?.titleTextColor, '#000000'),
      },
    ]
  }

  const flightDate = leg?.flightDate ? new Date(leg.flightDate) : new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  if (flightDate < sixMonthsAgo) {
    flightDate.setFullYear(flightDate.getFullYear() + 1)
  }

  const parsedPass: BoardingPass = {
    id: generateUUID(),
    passengerName: formatPassengerName(decoded.data?.passengerName || ''),
    operatingCarrierPNR: leg?.operatingCarrierPNR || '',
    departureAirport: leg?.departureAirport || '',
    arrivalAirport: leg?.arrivalAirport || '',
    operatingCarrierDesignator: leg?.operatingCarrierDesignator || '',
    flightNumber: leg?.flightNumber || '',
    flightDate: flightDate,
    seatNumber: (leg?.seatNumber || '').replace(/^0+/, ''),
    checkInSequenceNumber: (leg?.checkInSequenceNumber || '').replace(/^0+/, ''),
    airlineName,
    airlineLogoUrl,
    departureCity,
    arrivalCity,
    rawAztecData: text,
    theme,
    palette,
  }
  return parsedPass
}
