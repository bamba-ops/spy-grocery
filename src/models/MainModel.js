import { CheapestService } from '@/domain/services/CheapestService';
import { ListingService } from '@/domain/services/ListingService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const mainModel = defineStore('mainModel', () => {
    const _cheapestService = new CheapestService();
    const _listingService = new ListingService();

    // État existant
    const targetProduct = ref(null);
    const bestMatch = ref([]);
    const currentOffset = ref(0);
    const limit = ref(30);

    // NOUVEL ÉTAT OPTIONNEL : si tu veux stocker les résultats de la recherche
    const searchResults = ref([]);
    const totalFound = ref(0);

    // 1) GESTION DU "BEST PRICE"
    async function getBestPrice(product) {
        [targetProduct.value, bestMatch.value] = await _cheapestService.fetchBestPrice(product);
        console.log(bestMatch.value)
    }

    // 2) GET PRICES PAR STORE (LISTING PAGINÉ CLASSIQUE)
    async function getPricesByStoreId() {
        const { total_count, prices: _prices } = await _listingService.getPricesByStoreId(
            limit.value,
            currentOffset.value
        );
        currentOffset.value += limit.value;
        return { total_count, _prices };
    }

    // 3) NOUVELLE FONCTION DE RECHERCHE
    async function searchPricesByStoreAndName(storeId, productName) {

        const { total_count, prices: _prices } = await _listingService.searchPricesByStoreAndName(
            storeId,
            productName,
            limit.value,
            currentOffset.value
        );
        // Mettre à jour l’offset si on veut charger plus de pages ensuite
        currentOffset.value += limit.value;

        // Stocker le résultat dans un état local (optionnel)
        searchResults.value = _prices;
        totalFound.value = total_count;

        // Retourner aussi pour usage direct
        return { total_count, _prices };
    }

    // 4) Définir la méthode pour setter explicitement le product 
    // (et bestMatch) si besoin
    function setTargetProduct(_targetProduct) {
        targetProduct.value = _targetProduct;
    }

    function setBestMacth(_bestMatch) {
        bestMatch.value = _bestMatch;
    }

    return {
        // ÉTATS
        targetProduct,
        bestMatch,
        currentOffset,
        limit,
        searchResults,
        totalFound,

        // MÉTHODES
        getBestPrice,
        getPricesByStoreId,
        searchPricesByStoreAndName,
        setTargetProduct,
        setBestMacth
    };
});
