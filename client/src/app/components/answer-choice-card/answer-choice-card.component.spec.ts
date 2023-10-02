import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { AnswerChoiceCardComponent } from '@app/components/answer-choice-card/answer-choice-card.component';

describe('AnswerChoiceCardComponent', () => {
    let component: AnswerChoiceCardComponent;
    let fixture: ComponentFixture<AnswerChoiceCardComponent>;
    const TICKVALUE = 1000;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AnswerChoiceCardComponent],
        });
        fixture = TestBed.createComponent(AnswerChoiceCardComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should update borderColor and borderWidth when disabled is true', fakeAsync(() => {
        component.disabled = true;
        component.ngOnChanges();
        tick(TICKVALUE);
        expect(component.borderColor).toBe('black');
        expect(component.borderWidth).toBe('2px');
        expect(component.borderReset).toBe(true);
        discardPeriodicTasks();
    }));

    it('should reset selected and borderReset when disabled becomes false', fakeAsync(() => {
        component.disabled = false;
        component.borderReset = true;
        component.ngOnChanges();
        tick(TICKVALUE);
        expect(component.selected).toBe(false);
        expect(component.borderReset).toBe(false);
        discardPeriodicTasks();
    }));

    it('should set borderColor and borderWidth when selected is true', fakeAsync(() => {
        component.selected = true;
        component.ngOnChanges();
        tick(TICKVALUE);
        expect(component.borderColor).toBe('blue');
        expect(component.borderWidth).toBe('4px');
        discardPeriodicTasks();
    }));

    it('should set borderColor and borderWidth when selected is false', fakeAsync(() => {
        component.selected = false;
        component.ngOnChanges();
        tick(TICKVALUE);
        expect(component.borderColor).toBe('black');
        expect(component.borderWidth).toBe('2px');
        discardPeriodicTasks();
    }));

    it('should set backgroundColor to green when isCorrect is true', fakeAsync(() => {
        component.isCorrect = true;
        component.ngOnChanges();
        tick(TICKVALUE);
        expect(component.backgroundColor).toBe('green');
        discardPeriodicTasks();
    }));

    it('should set selected to false when it is true', () => {
        component.selected = true;
        component.selectedCard();

        expect(component.selected).toBe(false);
    });

    it('should set selected to true when it is false', () => {
        component.selected = false;
        component.selectedCard();

        expect(component.selected).toBe(true);
    });
});
