import { TimeService } from '@app/services/time.service';
import { TestBed } from '@angular/core/testing';

describe('QuizCreationService', () => {
    let service: TimeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
