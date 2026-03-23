import type { UIMessage } from 'ai'
import type { ListProduct } from './lists'

export interface ChatRequestBody {
  messages?: UIMessage[]
  createListMode?: boolean
}

export interface GroceryListDataPart {
  id?: string
  type: 'data-grocery-list'
  data: {
    items: ListProduct[]
  }
}
