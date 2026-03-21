import { convertToModelMessages, createGateway, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'
import type { ChatClientContext } from '#shared/types'
import type { SearchSort } from '#shared/types/search'
import { searchChatProducts } from '../../repositories/chatProductsRepository'
import { listChatStores } from '../../repositories/chatStoresRepository'

interface ChatServiceParams {
  supabase: any
  messages: UIMessage[]
  clientContext?: ChatClientContext
}

const MAX_MESSAGES = 24
const MAX_TEXT_CHARS = 1200
const MAX_TOOL_STEPS = 6
const TOOL_TIMEOUT_MS = 10000

const SEARCH_SORTS: SearchSort[] = ['price_asc', 'price_desc', 'title_asc', 'recent']

const SEARCH_PRODUCTS_SCHEMA = z.object({
  q: z.string().max(120).optional(),
  store: z.string().max(120).optional(),
  sort: z.enum(SEARCH_SORTS).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).max(2000).optional()
})

const SYSTEM_PROMPT = [
  'Tu es un assistant courses connecte a une base Supabase.',
  'Avant de generer une liste de courses, demande quelles recettes la personne veut cuisiner.',
  "Si la personne n'a pas d'idee, propose des recettes adaptees a son objectif (gym, budget, healthy, prise de masse, etc.).",
  "Suggestion puis recherche libre: si la personne demande directement une recherche produits, reponds sans blocage.",
  'Ensuite, identifie les ingredients necessaires et construis une liste realiste adaptee au nombre de personnes et a la duree.',
  'Cherche uniquement les prix disponibles en base et compare les magasins.',
  'Affiche les resultats groupes par magasin avec, pour chaque article: nom, quantite, prix.',
  'Affiche ensuite le sous-total par magasin et le total final.',
  'Si demande, optimise pour le panier le moins cher.',
  "Si des ingredients manquent en base, ne bloque pas: signale-les clairement et precise que la base contient surtout les speciaux actuellement.",
  "Precise aussi que les produits non-speciaux seront ajoutes plus tard.",
  'Regle interne: utiliser price_num pour les calculs/comparaisons, price_raw ou price_text pour afficher le prix.',
  'Ne jamais inventer de prix.',
  'Toujours utiliser les tools pour les donnees factuelles (produits, magasins).',
  'Sois clair, court et pratique.'
].join(' ')

const sanitizeMessages = (messages: UIMessage[]) => {
  const sliced = messages.slice(-MAX_MESSAGES)

  return sliced.map((message) => {
    const parts = Array.isArray((message as any).parts)
      ? (message as any).parts.map((part: any) => {
          if (part?.type === 'text' && typeof part.text === 'string') {
            return {
              ...part,
              text: part.text.replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, MAX_TEXT_CHARS).trim()
            }
          }

          return part
        })
      : []

    return {
      ...message,
      parts
    }
  })
}

const getErrorText = (error: unknown) => (error instanceof Error ? error.message : 'Unknown error')

const withTimeout = async <T>(label: string, fn: () => Promise<T>, timeoutMs = TOOL_TIMEOUT_MS): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  try {
    return await Promise.race([
      fn(),
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${label} timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      })
    ])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

const logToolCall = (toolName: string, startMs: number, sessionId: string, success: boolean, errorText?: string) => {
  const payload = {
    tool: toolName,
    sessionId,
    latencyMs: Date.now() - startMs,
    success,
    ...(errorText ? { error: errorText } : {})
  }

  if (success) {
    console.info('[chat.tool]', payload)
    return
  }

  console.warn('[chat.tool]', payload)
}

export const streamChatResponse = async ({ supabase, messages, clientContext }: ChatServiceParams) => {
  const runtimeConfig = useRuntimeConfig()
  const apiKey = runtimeConfig.aiGatewayApiKey || process.env.NUXT_AI_GATEWAY_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      message: 'Missing NUXT_AI_GATEWAY_API_KEY'
    })
  }

  const gateway = createGateway({ apiKey })
  const safeMessages = sanitizeMessages(messages)
  const sessionId = clientContext?.sessionId || `chat-${Date.now()}`

  const result = streamText({
    model: gateway(runtimeConfig.aiGatewayModel),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(safeMessages),
    stopWhen: stepCountIs(MAX_TOOL_STEPS),
    tools: {
      search_products: tool({
        description: 'Search products from the current products table with filters and pagination.',
        inputSchema: SEARCH_PRODUCTS_SCHEMA,
        strict: true,
        execute: async (input) => {
          const startedAt = Date.now()

          try {
            const data = await withTimeout('search_products', () =>
              searchChatProducts(supabase, {
                q: input.q,
                store: input.store,
                sort: input.sort,
                limit: input.limit,
                offset: input.offset
              })
            )

            logToolCall('search_products', startedAt, sessionId, true)
            return data
          } catch (error) {
            const errorText = getErrorText(error)
            logToolCall('search_products', startedAt, sessionId, false, errorText)
            return {
              error: errorText
            }
          }
        }
      }),
      get_stores: tool({
        description: 'List available stores derived from products rows.',
        inputSchema: z.object({}),
        strict: true,
        execute: async () => {
          const startedAt = Date.now()

          try {
            const stores = await withTimeout('get_stores', () => listChatStores(supabase))
            logToolCall('get_stores', startedAt, sessionId, true)
            return {
              stores
            }
          } catch (error) {
            const errorText = getErrorText(error)
            logToolCall('get_stores', startedAt, sessionId, false, errorText)
            return {
              error: errorText
            }
          }
        }
      })
    }
  })

  return result.toUIMessageStreamResponse({
    originalMessages: safeMessages,
    onError: (error) => {
      console.error('[chat.stream.error]', {
        sessionId,
        error: getErrorText(error)
      })
      return 'An error occurred while streaming the response.'
    }
  })
}
