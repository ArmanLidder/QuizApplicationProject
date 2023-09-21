import { TestBed } from '@angular/core/testing';

import { QuizValidationService } from './quiz-validation.service';

describe('FileValidationService', () => {
    let service: QuizValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuizValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
