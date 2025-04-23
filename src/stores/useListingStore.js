// stores/useListingStore.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/api/supabase';

export const useListingStore = defineStore("listingStore", () => {
    // état réactive (mutable)
    const debounceMs = 300
    let timer = null
    let products = ref([]);
    const searchMode = ref("multi")
    const isSortBy = ref(null)
    const stores = ref([]);
    const error = ref(null);
    const isLoading = ref(false);
    const isSortDropdownOpen = ref(false);
    let searchTerm = ref(null)
    // ② pagination locale
    const perPage = 30;
    const offset = ref(0)           // décalage pour la prochaine page
    const visibleCount = ref(perPage);
    const defaultImage = ref('https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg')
    const showPopup = ref(false)
    const selectedStoreId = ref(null)
    const selectedIsPromo = ref(false)
    const showLockedModal = ref(false)


    // getters (readonly, recalculés automatiquement)
    // stores/counter.js (useListingStore)

    // actions (font muter l’état)
    function onPopupClose(suppress) {
        showPopup.value = false;
        if (suppress) {
            localStorage.setItem('suppressPopup', 'true');
        }
    }
    function onImgError(event) {
        event.target.src = defaultImage.value
        // pour éviter une boucle si defaultImage est lui-même introuvable :
        event.target.onerror = null
    }

    function navToProductLink(link) {
        window.location.href = link;
    }

    async function getAllProductsSortBy(_isSortBy) {
        const suppressed = localStorage.getItem('suppressPopup')
        if (!suppressed) {
            setTimeout(() => {
                showPopup.value = true;
            }, 3000)

        }

        if (isSortBy.value == _isSortBy) {
            isSortBy.value = null
            isSortDropdownOpen.value = false;
            getAllProducts()
            return;
        }
        isLoading.value = true
        isSortBy.value = _isSortBy
        isSortDropdownOpen.value = false;
        offset.value = 0
        products.value = []
        try {
            const { data, error: rpcErr } = await supabase.rpc('get_products_page', {
                p_store_id: selectedStoreId.value,
                p_offset: offset.value,
                p_limit: perPage,
                p_search_text: searchTerm.value,
                p_sort_price: isSortBy.value,
                p_only_promo: selectedIsPromo.value

            })
            if (rpcErr) throw rpcErr

            products.value = data
            offset.value += data.length
            console.log('[store] chargés', data.length, 'produits → offset', offset.value)
        } catch (err) {
            console.error('[store] getAllProducts error', err)
            error.value = err.message
        } finally {

            isLoading.value = false
        }
    }

    async function getAllProductsProductsInPromo() {
        if (selectedIsPromo.value) {
            selectedIsPromo.value = null
            getAllProducts()
            return;
        }
        isLoading.value = true
        offset.value = 0
        products.value = []
        selectedIsPromo.value = true
        try {
            const { data, error: rpcErr } = await supabase.rpc('get_products_page', {
                p_store_id: selectedStoreId.value,
                p_offset: offset.value,
                p_limit: perPage,
                p_search_text: searchTerm.value,
                p_sort_price: isSortBy.value,
                p_only_promo: selectedIsPromo.value

            })
            if (rpcErr) throw rpcErr

            products.value = data
            offset.value += data.length
            console.log('[store] chargés', data.length, 'produits → offset', offset.value)
        } catch (err) {
            console.error('[store] getAllProducts error', err)
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    async function getAllProductsByStoreId(storeId) {
        if (selectedStoreId.value && storeId === selectedStoreId.value) {
            selectedStoreId.value = null
            getAllProducts()
            return;
        }
        isLoading.value = true
        offset.value = 0
        products.value = []
        selectedStoreId.value = storeId
        try {
            console.log('[store] getAllProducts – storeId=', storeId, 'offset=', offset.value)
            const { data, error: rpcErr } = await supabase.rpc('get_products_page', {
                p_store_id: selectedStoreId.value,
                p_offset: offset.value,
                p_limit: perPage,
                p_search_text: searchTerm.value,
                p_sort_price: isSortBy.value,
                p_only_promo: selectedIsPromo.value


            })
            if (rpcErr) throw rpcErr

            products.value = data
            offset.value += data.length
            console.log('[store] chargés', data.length, 'produits → offset', offset.value)
        } catch (err) {
            console.error('[store] getAllProducts error', err)
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    // 2) pages suivantes
    async function loadMore() {
        isLoading.value = true
        try {

            console.log('[store] loadMore – offset', offset.value)
            const { data, error: rpcErr } = await supabase.rpc('get_products_page', {
                p_offset: offset.value,
                p_limit: perPage,
                p_store_id: selectedStoreId.value,
                p_search_text: searchTerm.value,
                p_sort_price: isSortBy.value,
                p_only_promo: selectedIsPromo.value


            })
            if (rpcErr) throw rpcErr

            products.value.push(...data)
            offset.value += data.length
            console.log('[store] ajoutés', data.length, 'produits → total', products.value.length)
        } catch (err) {
            console.error('[store] loadMore error', err)
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    function navToProduct(productId) {
        window.location.href = `/product/${productId}`;
    }

    // 1) première page
    async function getAllProducts() {
        isLoading.value = true
        offset.value = 0
        products.value = []
        try {
            console.log('[store] getAllProducts – offset', offset.value)
            const { data, error: rpcErr } = await supabase.rpc('get_products_page', {
                p_offset: offset.value,
                p_limit: perPage,
                p_store_id: selectedStoreId.value,
                p_search_text: searchTerm.value,
                p_sort_price: isSortBy.value,
                p_only_promo: selectedIsPromo.value
            })
            if (rpcErr) throw rpcErr

            products.value = data
            offset.value += data.length
            console.log('[store] chargés', data.length, 'produits → offset', offset.value)
            console.log(data)
        } catch (err) {
            console.error('[store] getAllProducts error', err)
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }


    async function getProductsBySearch(search_text) {
        console.log("getProductsBySearch", search_text);
        offset.value = 0
        products.value = []
        isLoading.value = true;
        let { data, error } = await supabase
            .rpc('get_products_page', {
                p_offset: offset.value,
                p_limit: perPage,
                p_store_id: selectedStoreId.value,
                p_search_text: search_text,
                p_sort_price: isSortBy.value,
                p_only_promo: selectedIsPromo.value


            })
        if (error) console.error(error)
        else products.value = await data;
        offset.value += data.length

        isLoading.value = false;
    }

    async function getStores() {
        console.log("getStores")


        let { data, error } = await supabase
            .from('stores')
            .select('*')

        if (error) console.error(error)
        else stores.value = data

        console.log("stores", stores.value);
    }

    async function getStoresWithAccess() {
        console.log("getStoresWithAccess")

        let { data: stores_with_access, error } = await supabase
            .from('stores_with_access')
            .select('*')

        if (error) console.error(error)
        else stores.value = stores_with_access

        console.log("stores", stores.value);

    }

    function navToAuth() {
        showLockedModal.value = false;
        window.location.href = "/auth"
    }

    watch(searchTerm, async (newTerm) => {
        // on nettoie l’ancien timer
        clearTimeout(timer)

        isLoading.value = true
        // si la chaîne est vide, on peut vider les résultats ou ne rien faire
        if (!newTerm) {
            searchTerm.value = null
            getAllProducts()   // ou listing.getProducts('') selon votre logique
            return
        }

        timer = setTimeout(() => {
            getProductsBySearch(newTerm)
        }, debounceMs)

    });


    return {navToAuth , getStoresWithAccess, showLockedModal, selectedIsPromo, getAllProductsProductsInPromo, isSortBy, getAllProductsSortBy, selectedStoreId, getAllProductsByStoreId, getAllProducts, showPopup, onPopupClose, navToProduct, loadMore, visibleCount, perPage, isSortDropdownOpen, searchMode, getProductsBySearch, products, isLoading, getStores, stores, onImgError, navToProductLink, error, searchTerm };
});