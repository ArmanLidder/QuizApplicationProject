import { TestBed } from '@angular/core/testing';
import { QuizCreationService } from './quiz-creation.service';
import { FormQuestion } from '@app/interfaces/questionForm';

describe('QuizCreationService', () => {
    let service: QuizCreationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [QuizCreationService],
        });
        service = TestBed.inject(QuizCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a question', () => {
        service.addQuestion();
        expect(service.questions.length).toBe(1);
    });

    it('should add a choice to a question', () => {
        const question: FormQuestion = {
            type: 'qcm',
            text: '',
            points: 0,
            textchoix: '',
            selectedChoice: '',
            choices: [],
        };
        service.addChoice(question);

        expect(question.choices.length).toBe(1);
        const addedChoice = question.choices[0];
        expect(addedChoice.text).toBe('');
        expect(addedChoice.selectedChoice).toBe('');
    });

    it('should not add more than 4 choices to a question', () => {
        const question: FormQuestion = {
            type: 'qcm',
            text: '',
            points: 0,
            textchoix: '',
            selectedChoice: '',
            choices: [
                { text: 'Choice 1', selectedChoice: '' },
                { text: 'Choice 2', selectedChoice: '' },
                { text: 'Choice 3', selectedChoice: '' },
                { text: 'Choice 4', selectedChoice: '' },
            ],
        };
        service.addChoice(question);

        expect(question.choices.length).toBe(4);
    });
});
