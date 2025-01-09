import { DataAPISource } from "@/api/DataAPISource";

export class CheapestService {
    _apisource = new DataAPISource()

    async fetchBestPrice(product) {
        return await this._apisource.fetchBestPrice(product)
    }
}