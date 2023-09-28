import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { QuizService } from '@app/services/quiz.service';
import { Application } from '@app/app';
import { Container } from 'typedi';
import * as supertest from 'supertest';
import { StatusCodes } from 'http-status-codes';
import { expect } from 'chai';

describe('QuizController', () => {
    let quizService: SinonStubbedInstance<QuizService>;
    let expressApp: Express.Application;
    const testId = '1';
    const mockQuiz = {
        id: '1',
        title: 'Filler',
        description: 'filler description',
        duration: 30,
        lastModification: '2023-09-15',
        questions: [
            {
                type: 0,
                text: 'What is 2 + 2?',
                points: 5,
                choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
            },
        ],
        visible: true,
    };
    beforeEach(async () => {
        quizService = createStubInstance(QuizService);
        quizService.getAll.resolves([mockQuiz, mockQuiz, mockQuiz]);
        quizService.getAllVisible.resolves([mockQuiz, mockQuiz]);
        quizService.getById.resolves(mockQuiz);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['quizController'], 'quizService', { value: quizService, writable: true });
        expressApp = app.app;
    });

    it('should return quizzes from quiz service on valid get request', async () => {
        return supertest(expressApp)
            .get('/api/quiz')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal([mockQuiz, mockQuiz, mockQuiz]);
            });
    });

    it('should return visible quizzes from quiz service on valid get request', async () => {
        return supertest(expressApp)
            .get('/api/quiz/visible')
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal([mockQuiz, mockQuiz]);
            });
    });

    it('should return a specific quiz by id from quiz service on valid get request', async () => {
        return supertest(expressApp)
            .get(`/api/quiz/${testId}`)
            .expect(StatusCodes.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(mockQuiz);
            });
    });

    it('should properly handle post request of a specific quiz and call add method of quizService', async () => {
        const res = await supertest(expressApp).post('/api/quiz').send({ quiz: mockQuiz });
        expect(res.status).to.equal(StatusCodes.CREATED);
        expect(quizService.add.calledWith(mockQuiz)).to.equal(true);
    });

    it('should properly handle put request of a specific quiz and call replace method of quizService', async () => {
        const res = await supertest(expressApp).put('/api/quiz').send({ quiz: mockQuiz });
        expect(res.status).to.equal(StatusCodes.OK);
        expect(quizService.replace.calledWith(mockQuiz)).to.equal(true);
    });

    it('should properly handle patch request of a specific quiz with id and call update method of quizService', async () => {
        const updatedVisibility = false;
        const res = await supertest(expressApp).patch(`/api/quiz/${testId}`).send({ visible: updatedVisibility });

        expect(res.status).to.equal(StatusCodes.OK);
        expect(quizService.update.calledWith(testId, updatedVisibility)).to.equal(true);
    });

    it('should properly handle title uniqueness check request and call isTitleUnique method of quizService', async () => {
        const titleToCheck = 'New Quiz Title';
        const res = await supertest(expressApp).post('/api/quiz/checkTitleUniqueness').send({ title: titleToCheck });

        expect(res.status).to.equal(StatusCodes.OK);
        expect(quizService.isTitleUnique.calledWith(titleToCheck)).to.equal(true);
    });

    it('should properly handle delete request of a specific quiz by id and call delete method of quizService', async () => {
        const res = await supertest(expressApp).delete(`/api/quiz/${testId}`);
        expect(res.status).to.equal(StatusCodes.OK);
        expect(quizService.delete.calledWith(testId)).to.equal(true);
    });

    it('should handle the Internal Server error for all requests', async () => {
        quizService.getAll.throws(new Error('test error!'));
        quizService.getAllVisible.throws(new Error('test error!'));
        quizService.getById.throws(new Error('test error!'));
        quizService.add.throws(new Error('test error!'));
        quizService.replace.throws(new Error('test error!'));
        quizService.update.throws(new Error('test error!'));
        quizService.isTitleUnique.throws(new Error('test error!'));
        quizService.delete.throws(new Error('test error!'));
    
        let res = await supertest(expressApp).get('/api/quiz');
        expect(res.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
    
        let res2 = await supertest(expressApp).get('/api/quiz/visible');
        expect(res2.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
    
        let res3 = await supertest(expressApp).post('/api/quiz').send({ quiz: mockQuiz });
        expect(res3.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
    
        let res4 = await supertest(expressApp).put('/api/quiz').send({ quiz: mockQuiz });
        expect(res4.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
    
        let res5 = await supertest(expressApp).patch(`/api/quiz/${testId}`).send({ visible: false });
        expect(res5.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
    
        let res6 = await supertest(expressApp).post('/api/quiz/checkTitleUniqueness').send({ title: 'New Quiz Title' });
        expect(res6.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
    
        let res7 = await supertest(expressApp).delete(`/api/quiz/${testId}`);
        expect(res7.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);

        let res8 = await supertest(expressApp).get(`/api/quiz/${testId}`);
        expect(res8.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
    });
    
});
