import { convertToModelMessages, createGateway, stepCountIs, streamText, tool } from 'ai'
import { z } from 'zod'
import {
  QUERY_PRODUCTS_SQL_TOOL_NAME,
  SUBMIT_LIST_ITEMS_TOOL_NAME
} from '#shared/utils/aiChat'
import { executeProductsSelectSql } from '../../repositories/ai/productsSqlRepository'
import { getChatSystemPrompt } from './chat.constants'
import type { StreamChatWithProductsDbParams } from './chat.types'
import {
  getBlockedReason,
  listProductInputSchema,
  normalizeListItem,
  wrapSqlWithLimit
} from './chat.utils'

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

  const systemPrompt = getChatSystemPrompt(createListMode)
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
            toolName: QUERY_PRODUCTS_SQL_TOOL_NAME
          }
        }
      }

      if (createListMode && !hasSubmittedList && stepNumber >= 12) {
        return {
          activeTools: [SUBMIT_LIST_ITEMS_TOOL_NAME]
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
      [QUERY_PRODUCTS_SQL_TOOL_NAME]: tool({
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
            [SUBMIT_LIST_ITEMS_TOOL_NAME]: tool({
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
