import { HttpClientModule } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper/socket-client-service-test-helper';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { CorrectionQRLComponent } from './correction-qrl.component';

describe('CorrectionQRLComponent', () => {
    let component: CorrectionQRLComponent;
    let fixture: ComponentFixture<CorrectionQRLComponent>;
    const mockPoint = 40;
    const mockTimeOne = 23;
    const mockTimeTwo = 25;
    const mockTimeThree = 40;
    const mockTimeFour = 10;
    const mockTimeFive = 30;
    const initialIndex = -1;
    const mockResponsesQrl = new Map<string, { answers: string; time: number }>();
    const mockUsernames = ['Hamza', 'Arman', 'Rayan', 'Adlane', 'Ely'];
    const mockAnswers = ['Answer1', 'Answer2', 'Answer3', 'Answer4', 'Answer5'];
    const mockTimes = [mockTimeOne, mockTimeTwo, mockTimeThree, mockTimeFour, mockTimeFive];
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
        for (let i = 0; i < mockUsernames.length; i++) {
            mockResponsesQrl.set(mockUsernames[i], { answers: mockAnswers[i], time: mockTimes[i] });
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
        component.usernames = mockUsernames;
        component.answers = mockAnswers;
        component.nextAnswer();
        expect(component.indexPlayer).toEqual(2);
        expect(component.currentUsername).toEqual(mockUsernames[component.indexPlayer]);
        expect(component.currentAnswer).toEqual(mockAnswers[component.indexPlayer]);
        const expectedIndex = 9;
        component.indexPlayer = 8;
        component.nextAnswer();
        expect(component.indexPlayer).toEqual(expectedIndex);
    });

    it('should end Correction properly', () => {
        component.qrlAnswers = mockResponsesQrl;
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
        expect(component.indexPlayer).toEqual(initialIndex);
    });

    it('should initialize correctly', () => {
        spyOn(component, 'nextAnswer');
        component.qrlAnswers = mockResponsesQrl;
        component.isHostEvaluating = true;
        component.initialize();
        expect(component.indexPlayer).toEqual(initialIndex);
        expect(component.usernames.length).toEqual(mockUsernames.length);
        expect(component.answers.length).toEqual(mockAnswers.length);
        expect(component.nextAnswer).toHaveBeenCalled();
    });

    it('should submit point correctly', () => {
        spyOn(component, 'getCorrection');
        spyOn(component, 'nextAnswer').and.callThrough();
        spyOn(component, 'endCorrection');
        spyOn(component, 'clearAll');
        component.qrlAnswers = mockResponsesQrl;
        component.isHostEvaluating = true;
        component.initialize();
        component.indexPlayer = component.usernames.length - 1;
        component.isValid = true;
        component.inputPoint = 50;
        component.submitPoint();
        const [sendplayerQrlCorrection, sendplayerQrlCorrectionObject] = sendSpy.calls.allArgs()[0];
        expect(component.getCorrection).toHaveBeenCalled();
        expect(component.nextAnswer).toHaveBeenCalled();
        expect(component.inputPoint).toEqual(0);
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
            reponsesQRL: new SimpleChange(null, 'nouvelleValeurDeReponsesQRL', true),
        };
        component.ngOnChanges(changes);
        expect(component.initialize).toHaveBeenCalled();
        component.usernames = ['user1', 'user2'];
        component.ngOnChanges(changes);
        expect(component.isHostEvaluating).toBe(true);
    });
});
