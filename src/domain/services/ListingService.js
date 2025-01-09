import { DataAPISource } from "@/api/DataAPISource";

export class ListingService {
    _apisource = new DataAPISource()

    async getPricesByStoreId(limit = 30, offset = 0) {
        return await this._apisource.fetchPricesByStoreId(limit, offset)
    }
}