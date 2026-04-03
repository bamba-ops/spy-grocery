import { convertToModelMessages, createGateway, stepCountIs, streamText, tool } from 'ai'
import { z } from 'zod'
import type { ListProduct } from '#shared/types/lists'
import {
  QUERY_PRODUCTS_SQL_TOOL_NAME,
  SUBMIT_LIST_ITEMS_TOOL_NAME
} from '#shared/utils/aiChat'
import { executeProductsSelectSql } from '../../repositories/ai/productsSqlRepository'
import { buildSingleStoreListRows } from '../../repositories/productsRepository'
import { getChatSystemPrompt } from './chat.constants'
import type { StreamChatWithProductsDbParams } from './chat.types'
import {
  extractRequestedIngredientsFromMessages,
  getBlockedReason,
  getRequestedIngredientKey,
  listProductInputSchema,
  normalizeListItem,
  wrapSqlWithLimit
} from './chat.utils'

const MIN_INFERRED_SUBMITTED_ITEMS = 6
const MIN_INFERRED_MATCHED_ITEMS = 3

const getFallbackRequestedIngredients = (items: ListProduct[]) => {
  const deduped = new Set<string>()
  const fallback: Array<{ name: string; quantity: number | null }> = []

  for (const item of items) {
    const title = item.product.title.trim()
    if (!title) {
      continue
    }

    const key = getRequestedIngredientKey(title)
    if (!key || deduped.has(key)) {
      continue
    }

    deduped.add(key)
    fallback.push({
      name: title,
      quantity: Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : null
    })
  }

  return fallback
}

const getQuantityByKey = (
  requestedIngredients: Array<{ name: string; quantity: number | null }>,
  normalizedItems: ListProduct[]
) => {
  const quantityByRequestedKey = new Map<string, number>()

  for (const ingredient of requestedIngredients) {
    const key = getRequestedIngredientKey(ingredient.name)
    const quantity = ingredient.quantity

    if (!key || !Number.isInteger(quantity) || quantity <= 0) {
      continue
    }

    quantityByRequestedKey.set(key, quantity)
  }

  const quantityByProductTitleKey = new Map<string, number>()

  for (const item of normalizedItems) {
    const titleKey = getRequestedIngredientKey(item.product.title)
    const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1

    if (!titleKey) {
      continue
    }

    const existing = quantityByProductTitleKey.get(titleKey) || 0
    quantityByProductTitleKey.set(titleKey, existing + quantity)
  }

  return {
    quantityByRequestedKey,
    quantityByProductTitleKey
  }
}

const toListProductFromDbRow = (row: any, quantity: number): ListProduct => {
  return {
    product: {
      id: row.id,
      external_id: row.external_id ?? null,
      slug: row.slug,
      title_slug: row.title_slug ?? null,
      title: row.title || '',
      description: row.description ?? null,
      brand: row.brand ?? null,
      store: row.store,
      store_slug: row.store_slug ?? null,
      store_id: row.store_id ?? null,
      image_url: row.image_url ?? null,
      url: row.url ?? null,
      uom: row.uom ?? null,
      price_num: row.price_num ?? null,
      was_price_num: row.was_price_num ?? null,
      price_text: row.price_text ?? null,
      pre_price_text: row.pre_price_text ?? null,
      on_sale: row.on_sale ?? null,
      scraped_at: row.scraped_at ?? null
    },
    quantity
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
  let rejectedSubmitCount = 0

  return streamText({
    model: gateway(aiGatewayModel),
    temperature: createListMode ? 0 : undefined,
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
        if (stepNumber >= 12 && rejectedSubmitCount === 0) {
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
              const normalizedItems = items.map((item) => normalizeListItem(item))

              const parsedRequestedIngredients = extractRequestedIngredientsFromMessages(messages)
              const fallbackRequestedIngredients = getFallbackRequestedIngredients(normalizedItems)
              const hasExplicitRequestedIngredients = parsedRequestedIngredients.length > 0

              if (!hasExplicitRequestedIngredients && fallbackRequestedIngredients.length < MIN_INFERRED_SUBMITTED_ITEMS) {
                rejectedSubmitCount += 1
                console.log('[ai-list][service] submit_list_items rejected: inferred list too short', {
                  submittedItemsCount: fallbackRequestedIngredients.length,
                  minRequired: MIN_INFERRED_SUBMITTED_ITEMS,
                  rejectedSubmitCount
                })

                return {
                  ok: false,
                  reason: 'insufficient_inferred_ingredients',
                  submittedItemsCount: fallbackRequestedIngredients.length,
                  minRequired: MIN_INFERRED_SUBMITTED_ITEMS,
                  message: `When user ingredients are not explicit, infer and submit at least ${MIN_INFERRED_SUBMITTED_ITEMS} items.`
                }
              }

              const requestedIngredients = hasExplicitRequestedIngredients
                ? parsedRequestedIngredients
                : fallbackRequestedIngredients

              const requestedItems = requestedIngredients.map((entry) => entry.name)

              console.log('[ai-list][service] deterministic list selection input:', {
                requestedItemsCount: requestedItems.length,
                parsedRequestedIngredientsCount: parsedRequestedIngredients.length,
                fallbackRequestedIngredientsCount: fallbackRequestedIngredients.length
              })

              const deterministicSelection = await buildSingleStoreListRows(supabase, {
                requestedItems
              })

              if (!hasExplicitRequestedIngredients && deterministicSelection.matchedItems.length < MIN_INFERRED_MATCHED_ITEMS) {
                rejectedSubmitCount += 1
                console.log('[ai-list][service] submit_list_items rejected: low single-store coverage for inferred list', {
                  matchedItemsCount: deterministicSelection.matchedItems.length,
                  minRequired: MIN_INFERRED_MATCHED_ITEMS,
                  requestedItemsCount: requestedItems.length,
                  rejectedSubmitCount
                })

                return {
                  ok: false,
                  reason: 'insufficient_single_store_coverage',
                  matchedItemsCount: deterministicSelection.matchedItems.length,
                  minRequired: MIN_INFERRED_MATCHED_ITEMS,
                  requestedItemsCount: requestedItems.length,
                  message: `Infer items that can be covered in one store; need at least ${MIN_INFERRED_MATCHED_ITEMS} matched items.`
                }
              }

              const {
                quantityByRequestedKey,
                quantityByProductTitleKey
              } = getQuantityByKey(requestedIngredients, normalizedItems)

              const deterministicItems = deterministicSelection.matchedItems.map((entry) => {
                const requestedKey = getRequestedIngredientKey(entry.requestedItem)
                const requestedQuantity = requestedKey
                  ? quantityByRequestedKey.get(requestedKey)
                  : undefined
                const titleKey = getRequestedIngredientKey(entry.product.title || '')
                const titleQuantity = titleKey
                  ? quantityByProductTitleKey.get(titleKey)
                  : undefined
                const quantity = Number.isInteger(requestedQuantity) && requestedQuantity && requestedQuantity > 0
                  ? requestedQuantity
                  : (Number.isInteger(titleQuantity) && titleQuantity && titleQuantity > 0 ? titleQuantity : 1)

                return toListProductFromDbRow(entry.product, quantity)
              })

              const finalItems = deterministicItems

              hasSubmittedList = true

              onListItems?.(finalItems)

              console.log('[ai-list][service] deterministic list selection result:', {
                selectedStore: deterministicSelection.selectedStore,
                selectedStoreId: deterministicSelection.selectedStoreId,
                coverage: deterministicSelection.coverage,
                requestedItemsCount: requestedItems.length,
                matchedItemsCount: deterministicSelection.matchedItems.length,
                missingItemsCount: deterministicSelection.missingItems.length,
                totalEstimated: deterministicSelection.totalEstimated,
                returnedItemsCount: finalItems.length,
                usedFallbackItems: false
              })

              console.log('[ai-list][service] normalized list items ready:', {
                itemCount: finalItems.length
              })

              return {
                ok: true,
                count: finalItems.length,
                items: finalItems,
                selectedStore: deterministicSelection.selectedStore,
                selectedStoreId: deterministicSelection.selectedStoreId,
                coverage: deterministicSelection.coverage,
                missingItems: deterministicSelection.missingItems,
                totalEstimated: deterministicSelection.totalEstimated
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
