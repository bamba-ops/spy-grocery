import type { SearchProduct } from './index'

export interface ProductDetailsResponse {
  product: SearchProduct
  otherStoreProducts: SearchProduct[]
}

export interface ProductDetailsByRouteResponse extends ProductDetailsResponse {
  canonicalPath: string
  shouldRedirect: boolean
}
