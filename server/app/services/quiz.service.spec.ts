import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { MongoClient } from 'mongodb';
import { DatabaseServiceMock } from './database.service.mock';
import { QuizService } from './quiz.service';
import { fillerQuizzes } from 'assets/data';
// import { Quiz } from '@app/interfaces/quiz.interface';
chai.use(chaiAsPromised); // this allows us to test for rejection

describe('Quiz Service', () => {
    let quizService: QuizService;
    let databaseService: DatabaseServiceMock;
    // let client: MongoClient;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let testQuizzes: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extraQuiz: any = {
        id: '3',
        title: 'History Quiz',
        description: 'Test your knowledge of historical events!',
        duration: 60,
        lastModification: '2023-09-16',
        questions: [],
        visible: true,
    };
    beforeEach(async () => {
        testQuizzes = fillerQuizzes; // Note : First quiz is visible, Second quiz is not visible !
        databaseService = new DatabaseServiceMock();
        (await databaseService.start()) as MongoClient;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quizService = new QuizService(databaseService as any);
        testQuizzes.forEach(async (quiz) => {
            await quizService.collection.insertOne(quiz);
        });
    });

    const removeIds = () => {
        // MongoDb ajouter _ID inutile causant des problemes, donc à enlever
        testQuizzes.forEach((quiz) => {
            // eslint-disable-next-line no-underscore-dangle
            delete quiz._id;
        });
    };

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('should get all quizzes from DB', async () => {
        const quizzes = await quizService.getAll();
        removeIds();
        expect(testQuizzes).to.deep.equals(quizzes);
    });

    it('should get all visible quizzes from DB', async () => {
        const quizzes = await quizService.getAllVisible();
        removeIds();
        expect([testQuizzes[0]]).to.deep.equals(quizzes); // getallvisible should return only the first quiz, since it's the only visible
    });

    it('should get quiz by id', async () => {
        const TEST_ID = '2';
        const quizz = await quizService.getById(TEST_ID);
        removeIds();
        expect(testQuizzes[1]).to.deep.equals(quizz); // ID = 2  corresponds to the second quiz in data.ts
    });

    it('should add quizz', async () => {
        await quizService.add(extraQuiz);
        const quizzes = await quizService.collection.find({}).toArray();
        expect(quizzes.find((x) => x.id === extraQuiz.id)).to.deep.equals(extraQuiz);
    });

    it('should update a quiz', async () => {
        const TEST_ID = '1';
        await quizService.update(TEST_ID, false);
        const quizz = await quizService.getById(TEST_ID);
        expect(quizz.visible).to.equal(false); // quizz at id 1 was initially at true, now should be false
    });

    it('should check if a title is unique', async () => {
        const titleOne = 'Science Quiz';
        const resOne = await quizService.isTitleUnique(titleOne);
        expect(resOne).to.equal(false);

        const titleTwo = 'This title is for sure not in the database!!';
        const resTwo = await quizService.isTitleUnique(titleTwo);
        expect(resTwo).to.equal(true);
    });

    it('should delete a quizz', async () => {
        const TEST_ID = '1';
        await quizService.delete(TEST_ID);
        const quizzes = await quizService.collection.find({}).toArray();
        expect(quizzes.find((x) => x.id === TEST_ID)).to.equals(undefined);
    });
});
