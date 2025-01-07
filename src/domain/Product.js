export class Product {
    constructor(id, created_at, name, image_url, brand, unit, store_id, reference_id) {
        this.id = id;
        this.created_at = created_at
        this.name = name;
        this.image_url = image_url;
        this.brand = brand;
        this.unit = unit;
        this.store_id = store_id;
        this.reference_id = reference_id;
    }

    setDefaultBrand() {
        this.brand = this.brand != '' ? this.brand : '-';
    }

    setDefaultUnit() {
        this.unit = this.unit != '' ? this.unit : '-';
    }
}