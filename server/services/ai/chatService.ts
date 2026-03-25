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
  console.log('[ai-list][service] start streamChatWithProductsDb:', {
    createListMode,
    messageCount: messages.length,
    model: aiGatewayModel
  })

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
      console.log('[ai-list][service] prepareStep:', {
        stepNumber,
        createListMode,
        hasSubmittedList
      })

      if (createListMode && stepNumber === 0) {
        console.log('[ai-list][service] forcing initial sql tool call')
        return {
          toolChoice: {
            type: 'tool',
            toolName: QUERY_PRODUCTS_SQL_TOOL_NAME
          }
        }
      }

      if (createListMode && !hasSubmittedList) {
        if (stepNumber >= 12) {
          console.log('[ai-list][service] forcing submit_list_items tool call')
          return {
            toolChoice: {
              type: 'tool',
              toolName: SUBMIT_LIST_ITEMS_TOOL_NAME
            },
            activeTools: [SUBMIT_LIST_ITEMS_TOOL_NAME]
          }
        }

        return {
          toolChoice: 'required',
          activeTools: [QUERY_PRODUCTS_SQL_TOOL_NAME, SUBMIT_LIST_ITEMS_TOOL_NAME]
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
          console.log('[ai-list][service] query_products_sql tool called')
          const blockedReason = getBlockedReason(sql)

          if (blockedReason) {
            console.log('[ai-list][service] sql blocked:', blockedReason)
            return {
              blocked: blockedReason,
              rows: []
            }
          }

          const limitedSql = wrapSqlWithLimit(sql.trim())
          console.log('[ai-list][service] executing sql (trimmed):', limitedSql.slice(0, 220))
          const rows = await executeProductsSelectSql(supabase, limitedSql)

          console.log('[ai-list][service] sql rows returned:', {
            rowCount: Array.isArray(rows) ? rows.length : 0
          })

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
              console.log('[ai-list][service] submit_list_items tool called:', {
                itemCount: items.length
              })
              hasSubmittedList = true
              const normalizedItems = items.map((item) => normalizeListItem(item))
              onListItems?.(normalizedItems)

              console.log('[ai-list][service] normalized list items ready:', {
                itemCount: normalizedItems.length
              })

              return {
                ok: true,
                count: normalizedItems.length
              }
            }
          })
        }
        : {})
    },
    stopWhen: createListMode
      ? ({ steps }) => hasSubmittedList || steps.length >= 100
      : stepCountIs(100)
  })
}
