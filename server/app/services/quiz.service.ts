import { Service } from 'typedi';
import { DatabaseService } from '@app/services/database.service';
import * as process from 'process';
import { Quiz } from '@app/interfaces/quiz.interface';

@Service()
export class QuizService {
    constructor(private readonly dbService: DatabaseService) {}

    get collection() {
        return this.dbService.database.collection(process.env.DATABASE_COLLECTION_QUIZZES);
    }

    async getAll() {
        return (await this.collection.find({}).toArray()) as unknown[] as Quiz[];
    }

    async getAllVisible() {
        return (await this.collection.find({ visible: true }).toArray()) as unknown[] as Quiz[];
    }

    async getById(id: string) {
        const quiz = await this.collection.findOne({ id });
        return quiz as unknown as Quiz;
    }

    async add(quiz: Quiz) {
        await this.collection.insertOne(quiz);
    }

    async update(quiz: Quiz) {
        console.log(quiz);
        await this.collection.updateOne({ id: quiz.id }, { $set: quiz }, { upsert: true });
    }

    async delete(id: string) {
        await this.collection.deleteOne({ id });
    }
}
