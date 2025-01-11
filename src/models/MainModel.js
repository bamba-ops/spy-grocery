import { CheapestService } from '@/domain/services/CheapestService';
import { ListingService } from '@/domain/services/ListingService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const mainModel = defineStore('mainModel', () => {
    const _cheapestService = new CheapestService()
    const _listingService = new ListingService()

    const targetProduct = ref(null);
    const bestMatch = ref([])
    const currentOffset = ref(0)
    const limit = ref(30)

    async function getBestPrice(product) {
        [targetProduct.value, bestMatch.value] = await _cheapestService.fetchBestPrice(product)
        console.log(bestMatch.value)
    }

    async function getPricesByStoreId() {
        const { total_count, prices: _prices } = await _listingService.getPricesByStoreId(limit.value, currentOffset.value)
        currentOffset.value += limit.value
        return { total_count, _prices }
    }

    function setTargetProduct(_targetProduct) {
        targetProduct.value = _targetProduct
    }

    function setBestMacth(_bestMatch) {
        bestMatch.value = _bestMatch
    }

    return { targetProduct, bestMatch, getPricesByStoreId, getBestPrice, setTargetProduct, setBestMacth };
});
