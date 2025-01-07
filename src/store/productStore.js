import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProductStore = defineStore('productStore', () => {
    const targetProduct = ref(null);
    const bestMatch = ref([])

    function setTargetProduct(_targetProduct) {
        targetProduct.value = _targetProduct
    }

    function setBestMacth(_bestMatch) {
        bestMatch.value = _bestMatch
    }

    return { targetProduct, bestMatch, setTargetProduct, setBestMacth };
});
