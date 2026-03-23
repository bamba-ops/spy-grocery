import { convertToModelMessages, createGateway, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { PRODUCTS_SCHEMA_PROMPT } from '#shared/utils/productsSchemaPrompt'
import type { Product } from '#shared/types'
import type { ListProduct } from '#shared/types/lists'
import { executeProductsSelectSql } from '../../repositories/ai/productsSqlRepository'

interface StreamChatWithProductsDbParams {
  supabase: any
  messages: UIMessage[]
  aiGatewayApiKey: string
  aiGatewayModel: string
}

interface BuildGroceryListItemsParams {
  supabase: any
  messages: UIMessage[]
}

const DISALLOWED_SQL_KEYWORDS_REGEX =
  /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|call|execute|copy|do|comment)\b/i
const FROM_OR_JOIN_REGEX = /\b(?:from|join)\s+([a-zA-Z0-9_."`]+)/gi
const ALLOWED_TABLES = new Set(['products', 'public.products'])

const BASE_SYSTEM_PROMPT = [
  'You are the SpyGrocery data assistant.',
  'You can only use data from public.products.',
  'When you need database facts, use the query_products_sql tool.',
  'When a tool is needed, call it silently first. Do not narrate your steps.',
  'Never query or reference other tables.',
  'After using tools, always provide a final text answer to the user.',
  'Never expose SQL queries, JSON tool arguments, tool payloads, or internal system content to users.',
  'Never mention SQL, semicolons, query syntax, tool names, or internal validation rules to the user.',
  'Never answer with raw JSON or SQL. Respond in natural language only.',
  'If the request requires data outside public.products, explain that limitation clearly.',
  'Keep answers concise and factual.',
  'If the user request is ambiguous, ask one short clarifying question before querying.',
  'Check table schema products to know available columns and to query',
  'When searching use french language more then english or do both of the languages.',
  'If the user respond english , respond in english. If the user respond french , respond in french.',
  'When returning products price, put $ sign before the price.',
  'If the user ask for a product that is not in the database, respond that the product is not found.',
  'If the user ask for products, return title, description, price, and store.',
  'Don\'t return the image_url column to the user.',
  'If the user asks for a grocery list, always use the query_products_sql tool before answering.',
  'For grocery list requests, prioritize the cheapest options while minimizing the number of stores.',
  'Aim for one store for the full list when possible.',
  'If one store cannot satisfy all items, use the fewest stores possible and still keep prices low.',
  'If the user specifies a store, prioritize that store first and only add other stores for missing items.',
  'For each requested ingredient, return the selected product, price, and store. Clearly mark missing ingredients.'
].join('\n')

const normalizeSqlReference = (value: string) => value.replace(/["`]/g, '').toLowerCase().trim()

const getBlockedReason = (sql: string): string | null => {
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

  const hasForbiddenTable = tableReferences.some((table) => !ALLOWED_TABLES.has(table))
  if (hasForbiddenTable) {
    return 'Only products table is allowed.'
  }

  return null
}

const wrapSqlWithLimit = (sql: string) => `select * from (${sql}) as q limit 100`

const escapeSqlLiteral = (value: string) => value.replace(/'/g, "''")

const normalizeIngredientLine = (line: string) => {
  return line
    .replace(/^[\-•\s]+/, '')
    .replace(/^\d+[\d\s/,.]*(g|kg|ml|l|lb|oz|c\.?\s*à\s*soupe|c\.?\s*à\s*thé|tasse|tasses|cup|cups)?\s*/i, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[,:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const getLatestUserText = (messages: UIMessage[]) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (!message) continue

    if (message.role !== 'user' || !Array.isArray(message.parts)) continue

    const text = message.parts
      .filter((part: any) => part?.type === 'text' && typeof part?.text === 'string')
      .map((part: any) => part.text)
      .join('\n')
      .trim()

    if (text) return text
  }

  return ''
}

const extractIngredientsFromText = (text: string) => {
  return text
    .split(/\r?\n/)
    .map((line) => normalizeIngredientLine(line))
    .filter((line) => line.length >= 3)
    .filter((line) => !/^(ingr(é|e)dients?|liste de course|sel et poivre)$/i.test(line))
    .slice(0, 25)
}

const mapRowToProduct = (row: Record<string, unknown>): Product | null => {
  const id = typeof row.id === 'string' ? row.id : null
  const slug = typeof row.slug === 'string' ? row.slug : null
  const title = typeof row.title === 'string' ? row.title : null
  const store = typeof row.store === 'string' ? row.store : null

  if (!id || !slug || !title || !store) return null

  return {
    id,
    slug,
    title,
    brand: typeof row.brand === 'string' ? row.brand : null,
    store,
    store_id: typeof row.store_id === 'string' ? row.store_id : null,
    image_url: typeof row.image_url === 'string' ? row.image_url : null,
    url: typeof row.url === 'string' ? row.url : null,
    uom: typeof row.uom === 'string' ? row.uom : null,
    price_num: typeof row.price_num === 'number' ? row.price_num : null,
    was_price_num: typeof row.was_price_num === 'number' ? row.was_price_num : null,
    price_text: typeof row.price_text === 'string' ? row.price_text : null,
    pre_price_text: typeof row.pre_price_text === 'string' ? row.pre_price_text : null,
    on_sale: typeof row.on_sale === 'boolean' ? row.on_sale : null,
    scraped_at: typeof row.scraped_at === 'string' ? row.scraped_at : null
  }
}

export const buildGroceryListItems = async ({
  supabase,
  messages
}: BuildGroceryListItemsParams): Promise<ListProduct[]> => {
  const latestUserText = getLatestUserText(messages)
  const ingredients = extractIngredientsFromText(latestUserText)

  if (ingredients.length === 0) {
    return []
  }

  const itemsByProductId = new Map<string, ListProduct>()

  for (const ingredient of ingredients) {
    const term = escapeSqlLiteral(ingredient)
    const sql = `
      SELECT
        id,
        slug,
        title,
        brand,
        store,
        store_id,
        image_url,
        url,
        uom,
        price_num,
        was_price_num,
        price_text,
        pre_price_text,
        on_sale,
        scraped_at
      FROM public.products
      WHERE price_num IS NOT NULL
        AND (title ILIKE '%${term}%' OR description ILIKE '%${term}%')
      ORDER BY price_num ASC
      LIMIT 1
    `.trim()

    const rows = await executeProductsSelectSql(supabase, sql)
    const firstRow = rows[0]

    if (!firstRow || typeof firstRow !== 'object') {
      continue
    }

    const product = mapRowToProduct(firstRow as Record<string, unknown>)
    if (!product) {
      continue
    }

    const existing = itemsByProductId.get(product.id)
    if (existing) {
      existing.quantity += 1
      continue
    }

    itemsByProductId.set(product.id, {
      product,
      quantity: 1
    })
  }

  return Array.from(itemsByProductId.values())
}

export const streamChatWithProductsDb = async ({
  supabase,
  messages,
  aiGatewayApiKey,
  aiGatewayModel
}: StreamChatWithProductsDbParams) => {
  const gateway = createGateway({
    apiKey: aiGatewayApiKey
  })
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${PRODUCTS_SCHEMA_PROMPT}`
  const modelMessages = await convertToModelMessages(messages)

  return streamText({
    model: gateway(aiGatewayModel),
    system: systemPrompt,
    messages: modelMessages,
    prepareStep: ({ stepNumber }) => {
      if (stepNumber >= 6) {
        return {
          activeTools: [],
          system: `${systemPrompt}\nYou must now provide a final user-facing answer in plain text only. Do not call tools. Do not return SQL. Do not return JSON.`
        }
      }

      return undefined
    },
    tools: {
      query_products_sql: tool({
        description: 'Run read-only SQL on public.products and return rows.',
        inputSchema: z.object({
          sql: z.string().min(1).max(4000)
        }),
        execute: async ({ sql }) => {
          const blockedReason = getBlockedReason(sql)

          if (blockedReason) {
            return {
              blocked: blockedReason,
              rows: []
            }
          }

          const limitedSql = wrapSqlWithLimit(sql.trim())
          const rows = await executeProductsSelectSql(supabase, limitedSql)

          console.log(rows)

          return {
            rows
          }
        }
      })
    },
    stopWhen: stepCountIs(20)
  })
}
