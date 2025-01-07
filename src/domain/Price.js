export class Price {
    constructor(id, created_at, product_id, store_id, price, unit, product, store) {
        this.id = id;
        this.created_at;
        this.product_id = product_id;
        this.store_id = store_id;
        this.price = price;
        this.unit = unit;
        this.product = product;
        this.store = store;
    }

    setDefaultUnit() {
        this.unit = this.unit != '' ? this.unit : '-'
    }
}