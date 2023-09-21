import { TestBed } from '@angular/core/testing';

import { QuizImportationService } from './quiz-importation.service';

describe('QuizImportationService', () => {
  let service: QuizImportationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizImportationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
