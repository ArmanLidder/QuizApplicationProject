import { Db, MongoClient } from 'mongodb';
import { Service } from 'typedi';
import 'dotenv/config';
import { QuestionType, Quiz } from '@app/interfaces/quiz.interface';
import * as process from 'process';

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

        if ((await this.db.collection(process.env.DATABASE_COLLECTION_QUIZZES).countDocuments()) === 0) {
            const games = [
                {
                    id: '1',
                    title: 'Math Quiz',
                    duration: 30,
                    lastModification: '2023-09-15',
                    questions: [
                        {
                            type: QuestionType.QCM,
                            text: 'What is 2 + 2?',
                            points: 5,
                            choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
                        },
                        {
                            type: 1,
                            text: 'Solve for x: 3x - 7 = 14',
                            points: 10,
                        },
                    ],
                    visible: true,
                },
                {
                    id: '2',
                    title: 'Science Quiz',
                    duration: 45,
                    lastModification: '2023-09-15',
                    questions: [
                        {
                            type: QuestionType.QCM,
                            text: 'What is the chemical symbol for water?',
                            points: 5,
                            choices: [{ text: 'O2' }, { text: 'H2O', isCorrect: true }, { text: 'CO2' }],
                        },
                        {
                            type: QuestionType.QCM,
                            text: 'What is the boiling point of water in Celsius?',
                            points: 10,
                        },
                    ],
                    visible: true,
                },
            ];
            await this.populateDB(process.env.DATABASE_COLLECTION_QUIZZES, games);
        }
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async populateDB(collection: string, quizzes: Quiz[]): Promise<void> {
        console.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        for (const course of quizzes) {
            await this.db.collection(collection).insertOne(course);
        }
    }
}
