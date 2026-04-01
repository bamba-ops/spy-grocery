import type { UIMessage } from 'ai'
import type { ListProduct } from '#shared/types/lists'

export interface StreamChatWithProductsDbParams {
  supabase: unknown
  messages: UIMessage[]
  aiGatewayApiKey: string
  aiGatewayModel: string
  createListMode?: boolean
  onListItems?: (items: ListProduct[]) => void
}
