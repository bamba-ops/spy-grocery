export type ProductAvailability = 'active' | 'inactive'

const getTimestampOrNull = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const getIsProductActive = (
  validFrom: string | null | undefined,
  validTo: string | null | undefined,
  now: Date = new Date()
) => {
  const nowTimestamp = now.getTime()
  const validFromTimestamp = getTimestampOrNull(validFrom)
  const validToTimestamp = getTimestampOrNull(validTo)

  if (validFromTimestamp !== null && nowTimestamp < validFromTimestamp) {
    return false
  }

  if (validToTimestamp !== null && nowTimestamp > validToTimestamp) {
    return false
  }

  return true
}

export const getProductAvailability = (
  validFrom: string | null | undefined,
  validTo: string | null | undefined,
  now: Date = new Date()
): ProductAvailability => {
  return getIsProductActive(validFrom, validTo, now) ? 'active' : 'inactive'
}

export const getFormattedProductValidityDate = (
  value: string | null | undefined,
  locale: string = 'fr-CA'
) => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const getProductValidityLabel = (
  validFrom: string | null | undefined,
  validTo: string | null | undefined,
  locale: string = 'fr-CA',
  now: Date = new Date()
) => {
  const formattedValidFrom = getFormattedProductValidityDate(validFrom, locale)
  const formattedValidTo = getFormattedProductValidityDate(validTo, locale)
  const isActive = getIsProductActive(validFrom, validTo, now)

  if (formattedValidFrom && formattedValidTo) {
    if (isActive) {
      return `Valide du ${formattedValidFrom} au ${formattedValidTo}`
    }

    return `Promotion terminee le ${formattedValidTo}`
  }

  if (formattedValidTo) {
    if (isActive) {
      return `Valide jusqu'au ${formattedValidTo}`
    }

    return `Promotion terminee le ${formattedValidTo}`
  }

  if (formattedValidFrom) {
    if (isActive) {
      return `Valide depuis le ${formattedValidFrom}`
    }

    return `Promotion commencait le ${formattedValidFrom}`
  }

  return null
}
