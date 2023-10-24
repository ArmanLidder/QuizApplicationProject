import { expect } from 'chai';
import { fillerQuizzes } from '@app/mockData/data';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { QuizService } from 'app/services/quiz.service';
chai.use(chaiAsPromised);
import { Game } from './game';
import sinon = require('sinon');
import { SinonStubbedInstance } from 'sinon';

describe('Game', () => {
    let game: Game;
    let quizService: SinonStubbedInstance<QuizService>;
    const BONUS_MULTIPLIER = 1.2;
    // Before each test, create a new Game instance
    beforeEach(() => {
        quizService = sinon.createStubInstance(QuizService)
        quizService.getById.resolves(fillerQuizzes[0]);
        game = new Game(['Player1', 'Player2'], 'quizId', quizService); 
    });

    afterEach(() => {
        sinon.restore();
    });


    it('should initialize instance game correctly', () => {
        expect(game.players.size).to.equal(2);
    });

    it('should pass to the next question when next is called', () => {
       const updateScoresSpy = sinon.createStubInstance((game['updateScores']));
       const setValueSpy = sinon.createStubInstance((game['setValues']));
       updateScoresSpy.callsFake(()=> {})
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
