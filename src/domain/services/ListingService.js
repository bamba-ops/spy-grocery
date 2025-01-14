import { DataAPISource } from "@/api/DataAPISource";

export class ListingService {
    _apisource = new DataAPISource()

    /**
     * Méthode déjà existante :
     * Récupère tous les prix pour un store donné (STORE_ID défini côté DataAPISource).
     */
    async getPricesByStoreId(limit = 30, offset = 0) {
        return await this._apisource.fetchPricesByStoreId(limit, offset)
    }

    /**
     * NOUVELLE MÉTHODE : Recherche de prix par store_id + nom de produit (partiel).
     * On appelle la méthode correspondante de DataAPISource.
     */
    async searchPricesByStoreAndName(storeId, productName, limit = 30, offset = 0) {
        return await this._apisource.searchPricesByStoreAndName(
            storeId,
            productName,
            limit,
            offset
        );
    }
}
