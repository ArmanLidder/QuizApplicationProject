import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { TimeService } from '@app/services/time.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
//import { QuizChoice } from '@app/interfaces/quiz.interface';
//import { QuizService } from '@app/services/quiz.service';
import SpyObj = jasmine.SpyObj;

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;

    //let quizServiceSpy: SpyObj<QuizService>;
    let timeServiceSpy: SpyObj<TimeService>;
    let onCardSelectedSpy : jasmine.Spy;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports : [HttpClientModule, RouterTestingModule],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();

    });
    
    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        onCardSelectedSpy = spyOn(component, 'onCardSelected');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should deal correctly with enter button', () => {
        component.clickedValidation = false;
        component.answerChoices = [];


        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.buttonDetect(event);
        expect(component.clickedValidation).toBe(true);
        expect(onCardSelectedSpy).not.toHaveBeenCalled();
    })

    it('should deal correctly with number button presses', () => {
        component.answerChoices = [{text: 'test', isCorrect:true},{text: 'test2', isCorrect:false}];
        component.clickedValidation = false;


        const event = new KeyboardEvent('keydown', { key: '3' });
        component.buttonDetect(event);
        expect(onCardSelectedSpy).not.toHaveBeenCalled();

        const event2 = new KeyboardEvent('keydown', { key: '2' });
        component.buttonDetect(event2);
        expect(onCardSelectedSpy).toHaveBeenCalled();
    })
});
