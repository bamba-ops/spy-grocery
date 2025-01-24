import { DataAPISource } from '@/api/DataAPISource';

export class UnderConstructionService {
    constructor() {
        this._dataSource = new DataAPISource();
    }

    async subscribeToNewsletter(email) {
        return await this._dataSource.subscribeToNewsletter(email);
    }
} 