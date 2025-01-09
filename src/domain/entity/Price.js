
export class Price {
    constructor(id, product_id, store_id, price, unit, product, store) {
        this.id = id;
        this.product_id = product_id;
        this.store_id = store_id;
        this.price = price;
        this.unit = unit;
        this.product = product;
        this.store = store;
    }

    static fromJSON(json) {
        return new Price(json.id, json.product_id, json.store_id, json.price, json.unit, json.product, json.store)
    }

    setDefaultUnit() {
        this.unit = this.unit != '' ? this.unit : '-'
    }
}