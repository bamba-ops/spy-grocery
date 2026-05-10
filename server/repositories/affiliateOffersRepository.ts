import type { DbProduct } from '#shared/types'

const AFFILIATE_PRODUCT_SELECT_FIELDS = [
  'id',
  'title',
  'brand',
  'uom',
  'category',
  'search_term',
  'description'
].join(',')

export const getAffiliateProductRowById = async (
  supabase: any,
  productId: string
): Promise<Pick<DbProduct, 'id' | 'title' | 'brand' | 'uom' | 'category' | 'search_term' | 'description'> | null> => {
  const { data, error } = await supabase
    .from('products')
    .select(AFFILIATE_PRODUCT_SELECT_FIELDS)
    .eq('id', productId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to fetch affiliate product source: ${error.message}`
    })
  }

  return (data as Pick<DbProduct, 'id' | 'title' | 'brand' | 'uom' | 'category' | 'search_term' | 'description'> | null) ?? null
}
