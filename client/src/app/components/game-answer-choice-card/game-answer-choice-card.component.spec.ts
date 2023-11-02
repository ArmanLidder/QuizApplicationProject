import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameAnswerChoiceCardComponent } from './game-answer-choice-card.component';
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('GameAnswerChoiceCardComponent', () => {
    let component: GameAnswerChoiceCardComponent;
    let fixture: ComponentFixture<GameAnswerChoiceCardComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameAnswerChoiceCardComponent]
        });
        fixture = TestBed.createComponent(GameAnswerChoiceCardComponent);
        component = fixture.componentInstance;
        component.choice = { text: 'test', isCorrect: true };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call toggle select when pressing item index on key board', () => {
        const toggleSelectSpy = spyOn(component, 'toggleSelect');
        const emitSpy = spyOn(component.enterPressed, 'emit');
        component.index = 1;
        const keyboardEvent = new KeyboardEvent('keydown', { key: '1' });
        component.handleKeyboardEvent(keyboardEvent);
        expect(toggleSelectSpy).toHaveBeenCalled();
        expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should call toggle select when pressing item index on key board', () => {
        const toggleSelectSpy = spyOn(component, 'toggleSelect');
        const emitSpy = spyOn(component.enterPressed, 'emit');
        component.index = 1;
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        component.handleKeyboardEvent(keyboardEvent);
        expect(toggleSelectSpy).not.toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalled();
    });

    it('should call show Result during validation state', () => {
        const showResultSpy = spyOn<any>(component, 'showResult');
        component['gameService'].validated = true;
        component.ngOnChanges();
        expect(showResultSpy).toHaveBeenCalled();
    });

    it('should not call show Result if not during validation state', () => {
        const showResultSpy = spyOn<any>(component, 'showResult');
        component['gameService'].validated = false;
        component.ngOnChanges();
        expect(showResultSpy).not.toHaveBeenCalled();
    });

    it('should change isSelected value to true and show the appropriate feedback and emit the right number', () => {
        const showSelectionFeedbackSpy = spyOn<any>(component, 'showSelectionFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        const emitSpy = spyOn(component.selectEvent, 'emit');
        component.isSelected = false;
        component.index = 1;
        component.toggleSelect();
        expect(showSelectionFeedbackSpy).toHaveBeenCalled();
        expect(resetSpy).not.toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(0);
    });

    it('should change isSelected value to false and show the appropriate feedback and emit the right number', () => {
        const showSelectionFeedbackSpy = spyOn<any>(component, 'showSelectionFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        const emitSpy = spyOn(component.selectEvent, 'emit');
        component.isSelected = true;
        component.index = 1;
        component.toggleSelect();
        expect(showSelectionFeedbackSpy).not.toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
        expect(emitSpy).toHaveBeenCalledWith(0);
    });

    it('should show the appropriate feedback according to choice correctness value', () => {
        const showGoodAnswerFeedBackSpy = spyOn<any>(component, 'showGoodAnswerFeedBack');
        const showBadAnswerFeedBackSpy = spyOn<any>(component, 'showBadAnswerFeedBack');
        component.choice.text = 'test';
        component.choice.isCorrect = false;
        component['showResult']();
        expect(showGoodAnswerFeedBackSpy).not.toHaveBeenCalled();
        expect(showBadAnswerFeedBackSpy).toHaveBeenCalled();
        showBadAnswerFeedBackSpy.calls.reset();
        component.choice.isCorrect = true;
        component['showResult']();
        expect(showGoodAnswerFeedBackSpy).toHaveBeenCalled();
        expect(showBadAnswerFeedBackSpy).not.toHaveBeenCalled();
    });

    it('should set the class to normal when calling reset', () => {
        component['reset']();
        expect(component.feedbackDisplay).toEqual('active');
    });

    it('should set the class to selected when calling showSelectionFeedback', () => {
        component['showSelectionFeedback']();
        expect(component.feedbackDisplay).toEqual('selected');
    });

    it('should set the class to selected when calling showSelectionFeedback', () => {
        component['showGoodAnswerFeedBack']();
        expect(component.feedbackDisplay).toEqual('good-answer');
    });

    it('should set the class to selected when calling showSelectionFeedback', () => {
        component['showBadAnswerFeedBack']();
        expect(component.feedbackDisplay).toEqual('bad-answer');
    });

    it('should handle hover effect', ()=> {
        component.gameService.locked = true;
        expect(component.handleHoverEffect()).toEqual('');
        component.gameService.locked = false;
        expect(component.handleHoverEffect()).toEqual('active');
    })
});
