/* 
CODE TIRÉE DIRECTEMENT DE L'EXEMPLE MONGODB PAR NIKOLAY RADOEV
*/

import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

const DATABASE_NAME = 'database';

export class DatabaseServiceMock {
    private db: Db;
    private client: MongoClient;
    mongoServer: MongoMemoryServer;

    async start(url?: string): Promise<MongoClient | null> {
        if (!this.client) {
            this.mongoServer = await MongoMemoryServer.create();
            const mongoUri = this.mongoServer.getUri();
            this.client = new MongoClient(mongoUri);
            await this.client.connect();
            this.db = this.client.db(DATABASE_NAME);
        }

        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client ? this.client.close() : Promise.resolve();
    }

    get database(): Db {
        return this.db;
    }
}
