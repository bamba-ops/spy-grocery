import { convertToModelMessages, createGateway, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import { PRODUCTS_SCHEMA_PROMPT } from '#shared/utils/productsSchemaPrompt'
import { executeProductsSelectSql } from '../../repositories/ai/productsSqlRepository'

interface StreamChatWithProductsDbParams {
  supabase: any
  messages: UIMessage[]
  aiGatewayApiKey: string
  aiGatewayModel: string
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
  'If the user ask for products, return, title, descriptions, price, store',
  'Don\'t return the image_url column to the user.'
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

          return {
            rows
          }
        }
      })
    },
    stopWhen: stepCountIs(20)
  })
}
