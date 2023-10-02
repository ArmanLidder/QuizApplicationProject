import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Quiz, QuizChoice, QuizQuestion, QuestionType } from '@app/interfaces/quiz.interface';
import { QuizValidationService } from '@app/services/quiz-validation-service';
describe('QuizValidationService', () => {
    let service: QuizValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuizValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate quiz format', () => {
        const quiz: Quiz = {
            id: '1',
            title: 'Quiz Title',
            description: 'Quiz Description',
            duration: 30,
            lastModification: '2023-09-28',
            questions: [],
            visible: false,
        };
        expect(service.isValidQuizFormat(quiz)).toBeTruthy();
    });

    it('should validate choices form', () => {
        const control = new FormControl([
            { text: 'Choice 1', isCorrect: 'true' },
            { text: 'Choice 2', isCorrect: 'false' },
        ]);
        expect(service.validateChoicesForm(control)).toBeNull();
    });

    it('should validate divisible by ten', () => {
        const VALUE = 20;
        const control = new FormControl(VALUE);
        expect(service.divisibleByTen(control)).toBeNull();
    });

    it('should validate quiz', () => {
        const quiz: Quiz = {
            id: '1',
            title: 'Quiz Title',
            description: 'Quiz Description',
            duration: 30,
            lastModification: '2023-09-28',
            questions: [
                {
                    type: QuestionType.QCM,
                    text: 'Question 1',
                    points: 20,
                    choices: [
                        { text: 'Choice 1', isCorrect: true },
                        { text: 'Choice 2', isCorrect: false },
                    ],
                },
            ],
            visible: false,
        };
        const errors = service.validateQuiz(quiz);
        expect(errors.length).toBe(0);
    });

    it('should validate question', () => {
        const question: QuizQuestion = {
            type: QuestionType.QCM,
            text: 'Question Text',
            points: 20,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        const errors = service.validateQuestion(question, 0);
        expect(errors.length).toBe(0);
    });

    it('should validate question choices', () => {
        const choices: QuizChoice[] = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];
        const errors = service.validateQuestionChoices(0, choices);
        expect(errors.length).toBe(0);
    });
});
