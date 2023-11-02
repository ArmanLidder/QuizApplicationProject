// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
// import { SocketClientService } from '@app/services/socket-client.service';
// import { GameAnswersListComponent } from './game-answers-list.component';

// describe('GameAnswersListComponent', () => {
//     let component: GameAnswersListComponent;
//     let fixture: ComponentFixture<GameAnswersListComponent>;
//     let socketService: SocketClientServiceTestHelper;

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             declarations: [GameAnswersListComponent],
//             providers: [SocketClientService, { provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
//         });
//         fixture = TestBed.createComponent(GameAnswersListComponent);
//         component = fixture.componentInstance;
//         socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should validate properly', () => {
//         spyOn(socketService, 'send');
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const sendAnswerSpy = spyOn<any>(component.gameService, 'sendAnswer');
//         component.gameService.validated = false;
//         component.validate();
//         expect(sendAnswerSpy).toHaveBeenCalled();
//         sendAnswerSpy.calls.reset();
//         component.gameService.validated = true;
//         component.validate();
//         expect(sendAnswerSpy).not.toHaveBeenCalled();
//     });

//     it('should handle multiple emission', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const validateSpy = spyOn<any>(component, 'validate');
//         const checkIsIncremented = component['receptionDebounce'];
//         component.handleMultipleEmission();
//         expect(validateSpy).not.toHaveBeenCalled();
//         expect(component['receptionDebounce']).toEqual(checkIsIncremented + 1);

//         component.gameService.question = {
//             type: 0,
//             text: 'What is the capital of France?',
//             points: 10,
//             choices: [
//                 { text: 'Paris', isCorrect: true },
//                 { text: 'Berlin', isCorrect: false },
//                 { text: 'Madrid', isCorrect: false },
//             ],
//         };
//         let checkTheLenght = 0;
//         if (component.gameService.question?.choices?.length) {
//             checkTheLenght = component.gameService.question?.choices?.length - 1;
//         }
//         component['receptionDebounce'] = checkTheLenght;
//         component.handleMultipleEmission();
//         expect(component['receptionDebounce']).toEqual(0);
//         expect(validateSpy).toHaveBeenCalled();
//     });

//     it('should select the choice properly', () => {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const selectChoiceSpy = spyOn<any>(component.gameService, 'selectChoice');
//         component.selectChoice(1);
//         expect(selectChoiceSpy).toHaveBeenCalled();
//     });
// });
