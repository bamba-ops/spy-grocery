import { z } from 'zod'
import type { UIMessage } from 'ai'
import type { ListProduct } from '#shared/types/lists'
import {
  ALLOWED_PRODUCTS_TABLES,
  DISALLOWED_SQL_KEYWORDS_REGEX,
  FROM_OR_JOIN_REGEX
} from './chat.constants'

export interface RequestedIngredient {
  name: string
  quantity: number | null
}

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

const normalizeIngredientKey = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const MEAL_INTENT_KEYWORDS_REGEX = /\b(souper|diner|dejeuner|repas|menu|recette|plat|healthy|sain|equilibre|equilibr[ée]|rapide|pas\s+cher|budget)\b/i
const REQUEST_ACTION_KEYWORDS_REGEX = /\b(fais|faites|donne|cree|cr[ée]e|genere|g[ée]n[ée]re|prepare|propose|suggere|trouve|planifie)\b/i
const BUDGET_OR_SERVING_HINT_REGEX = /(\$|\b\d+\s*(?:cad|dollars?)\b|\b(pour|personne|personnes|portion|portions|sous|moins\s+de)\b)/i

const getHasListSeparators = (value: string) => /[\n,;•*-]/.test(value)

const getIsLikelyIntentSentence = (value: string) => {
  const normalized = value.trim().toLowerCase()

  if (!normalized) {
    return false
  }

  const hasMealIntentKeyword = MEAL_INTENT_KEYWORDS_REGEX.test(normalized)
  const hasActionKeyword = REQUEST_ACTION_KEYWORDS_REGEX.test(normalized)
  const hasBudgetOrServingHint = BUDGET_OR_SERVING_HINT_REGEX.test(normalized)

  if (hasMealIntentKeyword && (hasActionKeyword || hasBudgetOrServingHint)) {
    return true
  }

  return false
}

const getMessageText = (message: UIMessage) => {
  const textParts = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text.trim())
    .filter((value) => value.length > 0)

  if (textParts.length === 0) {
    return ''
  }

  return textParts.join('\n')
}

const getLastUserMessageText = (messages: UIMessage[]) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (!message || message.role !== 'user') {
      continue
    }

    const text = getMessageText(message)
    if (text) {
      return text
    }
  }

  return ''
}

const getNormalizedIngredientName = (value: string) => {
  return value
    .replace(/^[-*•\s]+/g, '')
    .replace(/^\d+[.)-]\s*/g, '')
    .replace(/^[-*•\s]+/g, '')
    .replace(/^(?:ingredients?|ingredient|liste)\s*:\s*/i, '')
    .replace(/^(?:fais(?:-moi)?|faites|donne(?:-moi)?|cree|cr[ée]e|genere|g[ée]n[ée]re|ajoute|ajouter)\s+/i, '')
    .replace(/^(?:je\s+veux|je\s+voudrais|j['’]?ai\s+besoin\s+de|il\s+me\s+faut|peux[-\s]?tu|pouvez[-\s]?vous|svp|stp)\s+/i, '')
    .replace(/^(?:une?\s+liste\s+(?:de|d')|liste\s+de|ingredients?\s+de)\s+/i, '')
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const getIsLikelyNoiseChunk = (value: string) => {
  const normalized = normalizeIngredientKey(value)

  if (!normalized) {
    return true
  }

  if (normalized.length <= 1) {
    return true
  }

  if (normalized === 'liste' || normalized === 'epicerie' || normalized === 'ingredients' || normalized === 'ingredient') {
    return true
  }

  return false
}

const parseIngredientChunk = (chunk: string): RequestedIngredient | null => {
  const cleanedChunk = getNormalizedIngredientName(chunk)

  if (!cleanedChunk || getIsLikelyNoiseChunk(cleanedChunk)) {
    return null
  }

  if (cleanedChunk.split(/\s+/).length > 10) {
    return null
  }

  const quantityPrefixMatch = cleanedChunk.match(/^(\d{1,3})\s*[x×]\s+(.+)$/i)
  if (quantityPrefixMatch) {
    const quantity = Number(quantityPrefixMatch[1])
    const name = getNormalizedIngredientName(quantityPrefixMatch[2] || '')

    if (!name || getIsLikelyNoiseChunk(name)) {
      return null
    }

    return {
      name,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null
    }
  }

  const quantitySuffixMatch = cleanedChunk.match(/^(.+?)\s*[x×]\s*(\d{1,3})$/i)
  if (quantitySuffixMatch) {
    const quantity = Number(quantitySuffixMatch[2])
    const name = getNormalizedIngredientName(quantitySuffixMatch[1] || '')

    if (!name || getIsLikelyNoiseChunk(name)) {
      return null
    }

    return {
      name,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null
    }
  }

  const numericPrefixMatch = cleanedChunk.match(/^(\d{1,3})\s+(.+)$/)
  if (numericPrefixMatch) {
    const quantity = Number(numericPrefixMatch[1])
    const name = getNormalizedIngredientName(numericPrefixMatch[2] || '')

    if (!name || getIsLikelyNoiseChunk(name)) {
      return null
    }

    return {
      name,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null
    }
  }

  return {
    name: cleanedChunk,
    quantity: null
  }
}

const splitRequestedIngredientChunks = (text: string) => {
  const normalized = text
    .replace(/\r/g, '\n')
    .replace(/[\t]+/g, ' ')
    .trim()

  if (!normalized) {
    return []
  }

  const primaryChunks = normalized
    .split(/[\n,;]+/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)

  if (primaryChunks.length > 1) {
    return primaryChunks
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length > 3 && words.length <= 18 && /\bet\b/i.test(normalized)) {
    return normalized
      .split(/\s+et\s+/i)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0)
  }

  return primaryChunks
}

export const extractRequestedIngredientsFromMessages = (messages: UIMessage[]): RequestedIngredient[] => {
  const userText = getLastUserMessageText(messages)

  if (!userText) {
    return []
  }

  const hasListSeparators = getHasListSeparators(userText)
  const isLikelyIntentSentence = getIsLikelyIntentSentence(userText)

  const chunks = splitRequestedIngredientChunks(userText)
  const parsed = chunks
    .map((chunk) => parseIngredientChunk(chunk))
    .filter((entry): entry is RequestedIngredient => Boolean(entry && entry.name))

  const merged = new Map<string, RequestedIngredient>()

  for (const entry of parsed) {
    const key = normalizeIngredientKey(entry.name)
    if (!key) {
      continue
    }

    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, entry)
      continue
    }

    const existingQuantity = existing.quantity || 0
    const nextQuantity = entry.quantity || 0

    merged.set(key, {
      name: existing.name,
      quantity: existingQuantity > 0 ? existingQuantity : (nextQuantity > 0 ? nextQuantity : null)
    })
  }

  const resolved = Array.from(merged.values())

  if (resolved.length === 0) {
    return []
  }

  if (!hasListSeparators && isLikelyIntentSentence) {
    return []
  }

  const firstResolved = resolved[0]

  if (!firstResolved) {
    return []
  }

  if (!hasListSeparators && resolved.length === 1 && firstResolved.name.split(/\s+/).length >= 5) {
    return []
  }

  return resolved
}

export const getRequestedIngredientKey = (value: string) => normalizeIngredientKey(value)

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
