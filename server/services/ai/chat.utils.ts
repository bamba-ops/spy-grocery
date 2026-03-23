import { z } from 'zod'
import type { ListProduct } from '#shared/types/lists'
import {
  ALLOWED_PRODUCTS_TABLES,
  DISALLOWED_SQL_KEYWORDS_REGEX,
  FROM_OR_JOIN_REGEX
} from './chat.constants'

const normalizeSqlReference = (value: string) => value.replace(/["`]/g, '').toLowerCase().trim()

export const getBlockedReason = (sql: string): string | null => {
  const normalizedSql = sql.trim()

  if (!/^select\s/i.test(normalizedSql)) {
    return 'Only SELECT queries are allowed.'
  }

  if (normalizedSql.includes(';')) {
    return 'Semicolons are not allowed in SQL input.'
  }

  if (DISALLOWED_SQL_KEYWORDS_REGEX.test(normalizedSql)) {
    return 'Disallowed SQL keyword detected.'
  }

  const tableReferences = Array.from(normalizedSql.matchAll(FROM_OR_JOIN_REGEX))
    .map((match) => normalizeSqlReference(match[1] || ''))
    .filter(Boolean)

  if (tableReferences.length === 0) {
    return 'Query must reference products table.'
  }

  const hasForbiddenTable = tableReferences.some((table) => !ALLOWED_PRODUCTS_TABLES.has(table))
  if (hasForbiddenTable) {
    return 'Only products table is allowed.'
  }

  return null
}

export const wrapSqlWithLimit = (sql: string) => `select * from (${sql}) as q limit 100`

export const listProductInputSchema = z.object({
  product: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    brand: z.string().nullable(),
    store: z.string().min(1),
    store_id: z.string().nullable(),
    image_url: z.string().nullable(),
    url: z.string().nullable(),
    uom: z.string().nullable(),
    price_num: z.number().nullable(),
    was_price_num: z.number().nullable(),
    price_text: z.string().nullable(),
    pre_price_text: z.string().nullable(),
    on_sale: z.boolean().nullable(),
    scraped_at: z.string().nullable()
  }),
  quantity: z.number().int().min(1)
})

export const normalizeListItem = (item: z.infer<typeof listProductInputSchema>): ListProduct => {
  return {
    product: {
      id: item.product.id,
      slug: item.product.slug,
      title: item.product.title,
      brand: item.product.brand ?? null,
      store: item.product.store,
      store_id: item.product.store_id ?? null,
      image_url: item.product.image_url ?? null,
      url: item.product.url ?? null,
      uom: item.product.uom ?? null,
      price_num: item.product.price_num ?? null,
      was_price_num: item.product.was_price_num ?? null,
      price_text: item.product.price_text ?? null,
      pre_price_text: item.product.pre_price_text ?? null,
      on_sale: item.product.on_sale ?? null,
      scraped_at: item.product.scraped_at ?? null
    },
    quantity: item.quantity
  }
}
