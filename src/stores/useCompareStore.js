// stores/authStore.js
import { defineStore } from 'pinia'

export const useCompareStore = defineStore('compare', {
    state: () => ({
        targetProduct: null,
        bestMatch: [],
        bestDeal: null,
        otherDeals: [],
        task: null,
        isError: false,
        isLoading: false,
        showModal: false,
        modalProduct: null,
        IMAGE_URL_ERROR: 'https://us.123rf.com/450wm/pgmart/pgmart1604/pgmart160400055/55602454-lettre-de-capital-s-des-bandes-entrelac%C3%A9es-blanches-sur-un-fond-noir-mod%C3%A8le-pour-embl%C3%A8me-logos-et.jpg',
        TARGET_STORE_ID: '32d6dd89-4216-4588-a096-631bfaf5df56',
    }),
    actions: {
        removeFirstProduct(id) {
            const targetArray = this.bestMatch.find((subArray) =>
                subArray.some((obj) => obj.id === id)
            );

            if (targetArray) {
                targetArray.shift();
                this.setBestPrice();
                if (targetArray.length == 0) {
                    this.closeModal();
                } else {
                    this.modalProduct = targetArray[0] || null;
                }
            } else {
                this.closeModal();
            }
        },

        openModal(product) {
            this.modalProduct = product;
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.modalProduct = null;
        },

        goToNextProduct() {
            if (this.modalProduct) {
                const targetArray = this.bestMatch.find(arr =>
                    arr.includes(this.modalProduct)
                );

                if (targetArray) {
                    const currentIndex = targetArray.indexOf(this.modalProduct);
                    const newIndex = (currentIndex + 1) % targetArray.length;
                    this.modalProduct = targetArray[newIndex];
                }
            }
        },

        goToPreviousProduct() {
            if (this.modalProduct) {
                const targetArray = this.bestMatch.find(arr =>
                    arr.includes(this.modalProduct)
                );

                if (targetArray) {
                    const currentIndex = targetArray.indexOf(this.modalProduct);
                    const newIndex = (currentIndex - 1 + targetArray.length) % targetArray.length;
                    this.modalProduct = targetArray[newIndex];
                }
            }
        },

        shouldShowBackButton() {
            if (!this.modalProduct) return false;
            const targetArray = this.bestMatch.find(arr =>
                arr.includes(this.modalProduct)
            );
            return targetArray && targetArray.indexOf(this.modalProduct) > 0;
        },

        confirmAsBest() {
            if (this.modalProduct) {
                const targetArray = this.bestMatch.find(arr =>
                    arr.includes(this.modalProduct)
                );

                const index = targetArray.indexOf(this.modalProduct);
                if (index > 0) {
                    const [confirmed] = targetArray.splice(index, 1);
                    targetArray.unshift(confirmed);
                    this.modalProduct = confirmed;
                }

                this.setBestPrice();
            }

            this.closeModal()
        },

        setBestPrice() {
            try {
                const allDeals = [this.targetProduct];
                this.bestMatch.forEach(subArray => {
                    if (subArray[0]) {
                        allDeals.push(subArray[0]);
                    }
                });

                allDeals.sort((a, b) => a.price - b.price);
                this.bestDeal = allDeals[0];
                this.otherDeals = allDeals.slice(1);
            } catch (error) {
                console.log(error);
                this.isError = true;
            }
        },

        getBestPrice() {
            try {
                this.task = JSON.parse(sessionStorage.getItem("user-task"))
                console.log(this.task)
                if (!this.task) {
                    this.isError = true
                    return
                }

                this.targetProduct = this.task.target_product
                this.bestMatch = this.task.best_match

                sessionStorage.removeItem("user-task")
                this.setBestPrice()
            } catch (error) {
                console.log(error)
                this.isError = true;
            }
        }
    },
    getters: {
        shouldDisableNext: (state) => {
            if (!state.modalProduct) return true;
            const targetArray = state.bestMatch.find(arr =>
                arr.includes(state.modalProduct)
            );
            return targetArray?.length <= 1;
        }
    }
})