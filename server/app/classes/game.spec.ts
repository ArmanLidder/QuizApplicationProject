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
        game.quiz = testQuiz;
        game['setValues']();
    });

    afterEach(async () => {
        await databaseService.closeConnection();
        sinon.restore();
    });

    it('should initialize instance game correctly', () => {
        expect(game.players.size).to.equal(2);
    });

    it('should upload next question when calling next', () => {
        game.next();
        expect(game.curr_index).to.equal(1);
        expect(game.question).to.equal(testQuiz.questions[game.curr_index].text)
        expect(game.playersAnswers.size).to.equal(0);
    });

    it('should correctly validate answers', () => {
        game.correctChoices = ['choice1', 'choice2']
        const invalidAnswer = ['choice1', 'choice3'];
        const invalidLength = ['choice1', 'choice2', 'plus']
        expect(game['validateAnswer'](game.correctChoices)).to.be.true;
        expect(game['validateAnswer'](invalidLength)).to.be.false;
        expect(game['validateAnswer'](invalidAnswer)).to.be.false;
    });

    it('should remove a player', () => {
        game.storePlayerAnswer('Player1', 1000, ['Paris']);
        game.storePlayerAnswer('Player2', 800, ['Paris']);
        game.storePlayerAnswer('Player3', 1200, ['Paris']);
        expect(game.playersAnswers.size).to.equal(3);
        game.removePlayer('Player2');
        expect(game.playersAnswers.size).to.equal(2);
        expect(game.playersAnswers.has('Player2')).to.be.false;
    });

    it('should handle wrong answers', () => {
        game.currentQuizQuestion = testQuiz.questions[0]; // Use the first question for testing
        game.correctChoices = ['Paris'];
        // Simulate player answers
        game.storePlayerAnswer('Player1', 1000, ['London']);
        game.storePlayerAnswer('Player2', 800, ['Paris']);
        game.storePlayerAnswer('Player3', 1200, ['Madrid']);
        game['handleWrongAnswer']('Player1');
        game['handleWrongAnswer']('Player2');
        game['handleWrongAnswer']('Player3');
        // All players' answers are wrong, so playersAnswers should be empty
        expect(game.playersAnswers.size).to.equal(0);
    });

    it('should get all players with correct answers', () => {
        game.currentQuizQuestion = testQuiz.questions[0]; // Use the first question for testing
        game.correctChoices = ['Paris'];
        // Simulate player answers
        game.storePlayerAnswer('Player1', 1000, ['Paris']);
        game.storePlayerAnswer('Player2', 800, ['Paris']);
        game.storePlayerAnswer('Player3', 1200, ['London']);
        game.storePlayerAnswer('Player4', 1100, ['Paris']);
        game.storePlayerAnswer('Player5', 900, ['Paris']);
        const playersWithCorrectAnswers = game['getAllPlayersCorrectAnswer']();
        // Only Player1, Player2, Player4, and Player5 have correct answers
        expect(playersWithCorrectAnswers.size).to.equal(4);
        expect(playersWithCorrectAnswers.has('Player1')).to.be.true;
        expect(playersWithCorrectAnswers.has('Player2')).to.be.true;
        expect(playersWithCorrectAnswers.has('Player4')).to.be.true;
        expect(playersWithCorrectAnswers.has('Player5')).to.be.true;
    });

    it('should correctly add bonus points', () => {
        const points = 10;
        const bonusPoints = game['addBonusPoint'](points);
        // Bonus points should be 10 * 1.2 = 12
        expect(bonusPoints).to.equal(12);
    });

    it('should configure players correctly', () => {
        expect(game.players.size).to.equal(2);
        expect(game.players.get('Player1')).to.deep.equal({ points: 0, bonusCount: 0 });
        expect(game.players.get('Player2')).to.deep.equal({ points: 0, bonusCount: 0 });
    });

    it('should set values correctly', () => {
        game['setValues']();
        expect(game.currentQuizQuestion).to.deep.equal(testQuiz.questions[0]);
        expect(game.question).to.equal('What is the capital of France?');
        expect(game.choicesStats.size).to.equal(4);
        expect(game.choicesStats.get('Paris')).to.equal(0);
        expect(game.choicesStats.get('London')).to.equal(0);
        expect(game.choicesStats.get('Berlin')).to.equal(0);
        expect(game.choicesStats.get('Madrid')).to.equal(0);
    });

    it('should correctly handle cases where there is one fastest player', () => {
        // Simulate player answers
        game.storePlayerAnswer('Player1', 1000, ['Paris']);
        game.storePlayerAnswer('Player2', 800, ['Paris']);
        game.storePlayerAnswer('Player3', 1200, ['Paris']);
        const fastestPlayer = game['getFastestPlayer']();
        expect(fastestPlayer.get('Player2').time).to.equal(800); // Player2 has the fastest time
    });

    it('should correctly handle cases where there is no fastest player', () => {
        // Simulate player answers
        game.storePlayerAnswer('Player1', 1000, ['Paris']);
        game.storePlayerAnswer('Player2', 1000, ['Paris']);
        const fastestPlayer = game['getFastestPlayer']();
        expect(fastestPlayer).to.be.null; // No single fastest player
    });

    it('should update scores correctly for good answers', () => {
        game.currentQuizQuestion = testQuiz.questions[0]; // Use the first question for testing
        game.correctChoices = ['Paris'];

        game.playersAnswers = new Map();
        game.players.set('Player1', { points: 0, bonusCount: 0 });
        game.players.set('Player2', { points: 0, bonusCount: 0 });
        game.players.set('Player3', { points: 0, bonusCount: 0 });

        // Simulate player answers
        game.storePlayerAnswer('Player1', 1000, ['Paris']);
        game.storePlayerAnswer('Player2', 800, ['Paris']);
        game.storePlayerAnswer('Player3', 1200, ['London']);

        game['updateScores']();

        // Check Player1's score
        const player1Score = game.players.get('Player1');
        expect(player1Score.points).to.equal(12); // 10 points (correct answer) + 1.2 bonus
        expect(player1Score.bonusCount).to.equal(1);

        // Check Player2's score
        const player2Score = game.players.get('Player2');
        expect(player2Score.points).to.equal(12); // 10 points (correct answer) + 1.2 bonus
        expect(player2Score.bonusCount).to.equal(1);

        // Player3's score should remain unchanged
        const player3Score = game.players.get('Player3');
        expect(player3Score.points).to.equal(0);
        expect(player3Score.bonusCount).to.equal(0);
    });

    it('should handle the case where there are no correct choices for a question', () => {
        game.currentQuizQuestion = testQuiz.questions[1]; // Use the second question for testing
        game.correctChoices = []; // No correct choices for this question

        game.playersAnswers = new Map();
        game.players.set('Player1', { points: 0, bonusCount: 0 });
        game.players.set('Player2', { points: 0, bonusCount: 0 });

        // Simulate player answers
        game.storePlayerAnswer('Player1', 1000, ['Paris']);
        game.storePlayerAnswer('Player2', 800, ['London']);

        game['updateScores']();

        // Check Player1's score
        const player1Score = game.players.get('Player1');
        expect(player1Score.points).to.equal(0); // No points as there are no correct choices
        expect(player1Score.bonusCount).to.equal(0);

        // Check Player2's score
        const player2Score = game.players.get('Player2');
        expect(player2Score.points).to.equal(0); // No points as there are no correct choices
        expect(player2Score.bonusCount).to.equal(0);
    });

    it('should correctly handle cases where there are multiple fastest players with the same time', () => {
        game.currentQuizQuestion = testQuiz.questions[0]; // Use the first question for testing
        game.correctChoices = ['Paris'];
        game.playersAnswers = new Map();
        game.players.set('Player1', { points: 0, bonusCount: 0 });
        game.players.set('Player2', { points: 0, bonusCount: 0 });
        game.players.set('Player3', { points: 0, bonusCount: 0 });
        game.storePlayerAnswer('Player1', 1000, ['Paris']);
        game.storePlayerAnswer('Player2', 1000, ['Paris']);
        game.storePlayerAnswer('Player3', 1000, ['Paris']);
        const fastestPlayers = game['getFastestPlayer']();
        expect(fastestPlayers).to.be.null;
    });
});
