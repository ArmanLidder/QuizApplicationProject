import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    get database(): Db {
        return this.db;
    }

    async start(url: string = process.env.DATABASE_URL): Promise<void> {
        try {
            this.client = new MongoClient(url);
            await this.client.connect();
            this.db = this.client.db(process.env.DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }

        if ((await this.db.collection(process.env.DATABASE_COLLECTION).countDocuments()) === 0) {
            // await this.populateDB();
        }
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    // async populateDB(): Promise<void> {}
}
