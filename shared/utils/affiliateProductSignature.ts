import { toSlug } from './toSlug'

interface AffiliateProductSignatureInput {
  title?: string | null
  brand?: string | null
  uom?: string | null
}

const getNormalizedSignaturePart = (value: string | null | undefined) => {
  return toSlug(value || '')
}

export const getAffiliateProductSignature = ({
  title,
  brand,
  uom
}: AffiliateProductSignatureInput) => {
  const parts = [
    getNormalizedSignaturePart(brand),
    getNormalizedSignaturePart(title),
    getNormalizedSignaturePart(uom)
  ].filter(Boolean)

  return parts.join('__')
}
