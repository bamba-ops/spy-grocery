import { convertToModelMessages, createGateway, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { PRODUCTS_SCHEMA_PROMPT } from '#shared/utils/productsSchemaPrompt'
import type { ListProduct } from '#shared/types/lists'
import { executeProductsSelectSql } from '../../repositories/ai/productsSqlRepository'

interface StreamChatWithProductsDbParams {
  supabase: any
  messages: UIMessage[]
  aiGatewayApiKey: string
  aiGatewayModel: string
  createListMode?: boolean
  onListItems?: (items: ListProduct[]) => void
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

const LIST_MODE_SYSTEM_PROMPT = [
  'You are in grocery-list construction mode.',
  'You must use query_products_sql to find real products from public.products for requested ingredients.',
  'Prioritize low prices and minimize number of stores when building the final list.',
  'When querying products for list mode, always select these product columns: id, slug, title, brand, store, store_id, image_url, url, uom, price_num, was_price_num, price_text, pre_price_text, on_sale, scraped_at.',
  'The rule about not returning image_url applies only to user-facing text. For submit_list_items, include image_url.',
  'When ready, call submit_list_items exactly once with the final items array.',
  'Each item must include product and quantity, and product must include all required fields.',
  'Quantity must be an integer >= 1.',
  'Do not output final prose to the user in this mode.'
].join('\n')

const listProductInputSchema = z.object({
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

const normalizeListItem = (item: z.infer<typeof listProductInputSchema>): ListProduct => {
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

export const streamChatWithProductsDb = async ({
  supabase,
  messages,
  aiGatewayApiKey,
  aiGatewayModel,
  createListMode = false,
  onListItems
}: StreamChatWithProductsDbParams) => {
  const gateway = createGateway({
    apiKey: aiGatewayApiKey
  })
  const modePrompt = createListMode ? `${LIST_MODE_SYSTEM_PROMPT}\n\n` : ''
  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${modePrompt}${PRODUCTS_SCHEMA_PROMPT}`
  const modelMessages = await convertToModelMessages(messages)
  let hasSubmittedList = false

  return streamText({
    model: gateway(aiGatewayModel),
    system: systemPrompt,
    messages: modelMessages,
    prepareStep: ({ stepNumber }) => {
      if (createListMode && stepNumber === 0) {
        return {
          toolChoice: {
            type: 'tool',
            toolName: 'query_products_sql'
          }
        }
      }

      if (createListMode && !hasSubmittedList && stepNumber >= 12) {
        return {
          activeTools: ['submit_list_items']
        }
      }

      if (stepNumber >= 6) {
        if (createListMode) {
          return undefined
        }

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

          return {
            rows
          }
        }
      }),
      ...(createListMode
        ? {
            submit_list_items: tool({
              description: 'Submit final grocery list items as ListProduct[].',
              inputSchema: z.object({
                items: z.array(listProductInputSchema).max(100)
              }),
              execute: async ({ items }) => {
                hasSubmittedList = true
                const normalizedItems = items.map((item) => normalizeListItem(item))
                onListItems?.(normalizedItems)

                return {
                  ok: true,
                  count: normalizedItems.length
                }
              }
            })
          }
        : {})
    },
    stopWhen: stepCountIs(20)
  })
}
