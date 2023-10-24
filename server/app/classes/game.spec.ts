import { expect } from 'chai';
import { QuestionType, QuizQuestion } from '@common/interfaces/quiz.interface';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { QuizService } from 'app/services/quiz.service';
chai.use(chaiAsPromised);
import { MongoClient, ObjectId } from 'mongodb';
import { DatabaseServiceMock } from 'app/services/database.service.mock';
import { Game } from './game';
import sinon = require('sinon');
import { DatabaseService } from '@app/services/database.service';

interface QuizMock {
    _id: ObjectId;
    id: string;
    title: string;
    description: string;
    duration: number;
    lastModification: string | null;
    questions: QuizQuestion[];
    visible: boolean;
}

describe('Game', () => {
    let game: Game;
    let databaseService: DatabaseServiceMock;
    let quizService: QuizService;
    const BONUS_MULTIPLIER = 1.2;
    const testQuiz : QuizMock = {
        _id: new ObjectId(),
        id: 'quiz123',
        title: 'Sample Quiz',
        description: 'This is a sample quiz for testing purposes.',
        duration: 180,
        lastModification: 'none',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'London', isCorrect: false },
                    { text: 'Berlin', isCorrect: false },
                    { text: 'Madrid', isCorrect: false },
                ],
            },
            {
                type: QuestionType.QCM,
                text: 'Which of the following are prime numbers?',
                points: 15,
                choices: [
                    { text: '2', isCorrect: true },
                    { text: '4', isCorrect: false },
                    { text: '7', isCorrect: true },
                    { text: '10', isCorrect: false },
                ],
            },
        ],
        visible: true,
    };

    beforeEach(async () => {
        databaseService = new DatabaseServiceMock();
        (await databaseService.start()) as MongoClient;
        quizService = new QuizService(databaseService as unknown as DatabaseService);
        delete testQuiz['_id'];
        await quizService.collection.insertOne(testQuiz);
        game = new Game(['Player1', 'Player2'], 'quiz123', quizService);
    });

    afterEach(async () => {
        await databaseService.closeConnection();
        sinon.restore();
    });

    it('should initialize instance game correctly', () => {
        expect(game.players.size).to.equal(2);
    });

    it('should pass to the next question when next is called', () => {
       const updateScoresSpy = sinon.createStubInstance((game['updateScores']));
       const setValueSpy = sinon.createStubInstance((game['setValues']));
       updateScoresSpy.callsFake(()=> {});
       setValueSpy.callsFake(() => {})
       game.curr_index = 0;
       game.next();
       expect(updateScoresSpy.called);
       expect(setValueSpy.called);
       expect(game.playersAnswers.size).to.equal(0);
       expect(game.curr_index).to.equal(1);
    });

    it('should update scores correctly for a good answer', () => {
        const username = 'Player1';
        //const playerAnswer = ['choice1', 'choice2'];
        const expectedPoints = game.currentQuizQuestion.points * BONUS_MULTIPLIER;

        game['handleGoodAnswer'](username);

        const player = game.players.get(username);
        expect(player.points).to.equal(expectedPoints);
        expect(player.bonusCount).to.equal(1);
    });

    it('should correctly validate answers', () => {
        const correctAnswers = game.correctChoices;
        const validAnswer = ['choice1', 'choice2'];
        const invalidAnswer = ['choice1', 'choice3'];
        expect(game['validateAnswer'](correctAnswers)).to.be.true;
        expect(game['validateAnswer'](validAnswer)).to.be.false;
        expect(game['validateAnswer'](invalidAnswer)).to.be.false;
    });

    // More test cases for other methods
});
