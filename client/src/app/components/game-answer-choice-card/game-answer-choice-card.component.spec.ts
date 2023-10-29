import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameAnswerChoiceCardComponent } from './game-answer-choice-card.component';

describe('GameAnswerChoiceCardComponent', () => {
  let component: GameAnswerChoiceCardComponent;
  let fixture: ComponentFixture<GameAnswerChoiceCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameAnswerChoiceCardComponent]
    });
    fixture = TestBed.createComponent(GameAnswerChoiceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
