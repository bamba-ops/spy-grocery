import type { SearchProduct } from './index'

export interface ProductDetailsResponse {
  product: SearchProduct
  otherStoreProducts: SearchProduct[]
}
