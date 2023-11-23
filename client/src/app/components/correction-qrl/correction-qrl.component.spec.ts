import { HttpClientModule } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { CorrectionQRLComponent } from './correction-qrl.component';

fdescribe('CorrectionQRLComponent', () => {
    let component: CorrectionQRLComponent;
    let fixture: ComponentFixture<CorrectionQRLComponent>;
    let mockPoint = 40;
    let mockreponsesQRL = new Map<string, { answers: string; time: number }>();
    const mokcUsernames = ['Hamza', 'Arman', 'Rayan', 'Adlane', 'Ely'];
    const mockAnswers = ['Answer1', 'Answer2', 'Answer3', 'Answer4', 'Answer5'];
    const mockTime = [23, 25, 40, 10, 30];
    let socketService: SocketClientServiceTestHelper;
    let sendSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [CorrectionQRLComponent],
            providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        });
        fixture = TestBed.createComponent(CorrectionQRLComponent);
        component = fixture.componentInstance;
        for (let i = 0; i < mokcUsernames.length; i++) {
            mockreponsesQRL.set(mokcUsernames[i], { answers: mockAnswers[i], time: mockTime[i] });
        }
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        fixture.detectChanges();
        sendSpy = spyOn(socketService, 'send').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update correctly correction point', () => {
        component.getCorrection(mockPoint);
        expect(component.points[component.indexPlayer]).toEqual(mockPoint);
    });

    it('should go to the next answer', () => {
        component.indexPlayer = 1;
        component.usernames = mokcUsernames;
        component.answers = mockAnswers;
        component.nextAnswer();
        expect(component.indexPlayer).toEqual(2);
        expect(component.currentUsername).toEqual(mokcUsernames[component.indexPlayer]);
        expect(component.currentAnswer).toEqual(mockAnswers[component.indexPlayer]);
        component.indexPlayer = 8;
        component.nextAnswer();
        expect(component.indexPlayer).toEqual(9);
    });

    it('should end Correction preperly', () => {
        component.reponsesQRL = mockreponsesQRL;
        component.isHostEvaluating = true;
        component.initialize();
        component.endCorrection();
        expect(component.reponsesQRLCorrected).toBeTruthy();
    });

    it('should clear all', () => {
        component.clearAll();
        expect(component.usernames.length).toEqual(0);
        expect(component.answers.length).toEqual(0);
        expect(component.points.length).toEqual(0);
        expect(component.reponsesQRLCorrected.size).toEqual(0);
        expect(component.indexPlayer).toEqual(-1);
    });

    it('should initialize correctly', () => {
        spyOn(component, 'nextAnswer');
        component.reponsesQRL = mockreponsesQRL;
        component.isHostEvaluating = true;
        component.initialize();
        expect(component.indexPlayer).toEqual(-1);
        expect(component.usernames.length).toEqual(mokcUsernames.length);
        expect(component.answers.length).toEqual(mockAnswers.length);
        expect(component.nextAnswer).toHaveBeenCalled();
    });

    it('should submit point correctly', () => {
        spyOn(component, 'getCorrection');
        spyOn(component, 'nextAnswer').and.callThrough();
        spyOn(component, 'endCorrection');
        spyOn(component, 'clearAll');
        component.reponsesQRL = mockreponsesQRL;
        component.isHostEvaluating = true;
        component.initialize();
        component.indexPlayer = component.usernames.length - 1;
        component.isValid = true;
        component.inputPoint = 50;
        component.submitPoint();
        const [sendplayerQrlCorrection, sendplayerQrlCorrectionObject] = sendSpy.calls.allArgs()[0];
        expect(component.getCorrection).toHaveBeenCalled();
        expect(component.nextAnswer).toHaveBeenCalled();
        expect(component.inputPoint).toEqual(2);
        expect(component.isCorrectionFinished).toBeTruthy();
        expect(component.endCorrection).toHaveBeenCalled();
        expect(component.clearAll).toHaveBeenCalled();
        expect(component.isHostEvaluating).toBeFalsy();
        expect(sendplayerQrlCorrectionObject).toBeDefined();
        expect(sendplayerQrlCorrection).toBeDefined();
    });

    it('should change when there is a change', () => {
        spyOn(component, 'initialize');
        const changes: SimpleChanges = {
            reponsesQRL: new SimpleChange(null, 'nouvelleValeurDeReponsesQRL', true)
        };
        component.ngOnChanges(changes);
        expect(component.initialize).toHaveBeenCalled();
        component.usernames = ['user1', 'user2'];
        component.ngOnChanges(changes);
        expect(component.isHostEvaluating).toBe(true);
    });
});