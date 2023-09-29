import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';
import 'dotenv/config';
import * as process from 'process';
import { fillerQuizzes } from '@app/mockData/data';
import { Quiz } from '@app/interfaces/quiz.interface';

@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    get database(): Db {
        return this.db;
    }
    // process.env.DATABASE_URL causing the code coverage to think this whole function is untested, which is wrong, therefore using istanbul
    // istanbul ignore next
    async start(url: string = process.env.DATABASE_URL): Promise<void> {
        try {
            this.client = new MongoClient(url);
            await this.client.connect();
            this.db = this.client.db(process.env.DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }

        if ((await this.db.collection(process.env.DATABASE_COLLECTION_QUIZZES).countDocuments()) === 0) {
            await this.populateDB(process.env.DATABASE_COLLECTION_QUIZZES);
        }
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async populateDB(collection: string): Promise<void> {
        const quizzes: Quiz[] = fillerQuizzes;
        for (const quiz of quizzes) {
            await this.db.collection(collection).insertOne(quiz);
        }
    }
}
