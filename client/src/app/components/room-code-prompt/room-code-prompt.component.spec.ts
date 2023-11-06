import { RoomCodePromptComponent } from './room-code-prompt.component';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

// Disable the eslint rule that changes any occurrence to unknown when running npm run lint:fix
// Because some spies are on private method
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('RoomCodePromptComponent', () => {
    let component: RoomCodePromptComponent;
    let socketService: SocketClientServiceTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RoomCodePromptComponent],
            providers: [{ provide: SocketClientService, useClass: SocketClientServiceTestHelper }],
        }).compileComponents();
        component = TestBed.createComponent(RoomCodePromptComponent).componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should connect to the socket service on init', () => {
        const connectSpy = spyOn(component, 'connect');
        component.ngOnInit();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should connect only if socket is not alive', () => {
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return false;
        });
        const connectSpy = spyOn(socketService, 'connect');
        component.connect();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should not connect  if socket is alive', () => {
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        const connectSpy = spyOn(socketService, 'connect');
        component.connect();
        expect(connectSpy).not.toHaveBeenCalled();
    });

    it('should emit the room ID when calling sendRoomIdToWaitingRoom', () => {
        const sendRoomDataSpy = spyOn(component.sendRoomData, 'emit');
        component.roomId = '1';
        component.sendRoomIdToWaitingRoom();
        expect(sendRoomDataSpy).toHaveBeenCalledWith(1);
    });

    it('should emit component status when validation done', () => {
        const sendRoomDataSpy = spyOn(component.validationDone, 'emit');
        component.isActive = true;
        component.sendValidationDone();
        expect(sendRoomDataSpy).toHaveBeenCalledWith(true);
    });

    it('should send room id to server only if room id is a number', fakeAsync(() => {
        const roomIdClientValidationSpy = spyOn<any>(component, 'roomIdClientValidation');
        const sendRoomIdSpy = spyOn<any>(component, 'sendRoomId');
        spyOn<any>(component, 'isOnlyDigit').and.callFake(() => {
            return true;
        });
        component.validateRoomId();
        expect(sendRoomIdSpy).toHaveBeenCalled();
        expect(roomIdClientValidationSpy).not.toHaveBeenCalled();
    }));

    it('should not send room id to server and display error if room id is not a number', fakeAsync(() => {
        const roomIdClientValidationSpy = spyOn<any>(component, 'roomIdClientValidation');
        const sendRoomIdSpy = spyOn<any>(component, 'sendRoomId');
        spyOn<any>(component, 'isOnlyDigit').and.callFake(() => {
            return false;
        });
        component.validateRoomId();
        expect(sendRoomIdSpy).not.toHaveBeenCalled();
        expect(roomIdClientValidationSpy).toHaveBeenCalled();
    }));

    it('should not accept empty username', fakeAsync(() => {
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        component.username = '';
        component.validateUsername();
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(component.error).toEqual("Le nom de l'utilisateur doit contenir au moins un caractère!");
    }));

    it('should not accept only whitespace in username', fakeAsync(() => {
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        component.username = ' ';
        component.validateUsername();
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(component.error).toEqual("Le nom de l'utilisateur doit contenir au moins un caractère!");
    }));

    it('should not accept organisateur as username', fakeAsync(() => {
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        component.username = 'Organisateur';
        component.validateUsername();
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(component.error).toEqual("Le nom de l'utilisateur ne peut pas être Organisateur!");
    }));

    it('should send username if it passes client side validation', fakeAsync(() => {
        const sendUsernameSpy = spyOn<any>(component, 'sendUsername');
        component.username = 'test';
        component.validateUsername();
        expect(sendUsernameSpy).toHaveBeenCalled();
    }));

    it('should not access room if room is locked', fakeAsync(() => {
        const sendJoinRoomRequestSpy = spyOn<any>(component, 'sendJoinRoomRequest');
        const sendRoomIdToWaitingRoomSpy = spyOn(component, 'sendRoomIdToWaitingRoom');
        const sendValidationDoneSpy = spyOn(component, 'sendValidationDone');
        component.isLocked = false;
        component.joinRoom();
        expect(sendJoinRoomRequestSpy).toHaveBeenCalled();
        expect(sendRoomIdToWaitingRoomSpy).not.toHaveBeenCalled();
        expect(sendValidationDoneSpy).not.toHaveBeenCalled();
        expect(component.isActive).toBeTruthy();
    }));

    it('should access room if room is not locked', async () => {
        const sendJoinRoomRequestSpy = spyOn<any>(component, 'sendJoinRoomRequest');
        const sendRoomIdToWaitingRoomSpy = spyOn(component, 'sendRoomIdToWaitingRoom');
        const sendValidationDoneSpy = spyOn(component, 'sendValidationDone');
        component.isLocked = false;
        component.isRoomIdValid = true;
        await component.joinRoom();
        expect(sendJoinRoomRequestSpy).toHaveBeenCalled();
        expect(sendRoomIdToWaitingRoomSpy).toHaveBeenCalled();
        expect(sendValidationDoneSpy).toHaveBeenCalled();
        expect(component.isActive).toBeFalsy();
    });

    it('should set the error and display if room id is not a number', () => {
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        spyOn<any>(component, 'isOnlyDigit').and.callFake(() => {
            return false;
        });
        component['roomIdClientValidation']();
        expect(component.error).toEqual('Votre code doit contenir seulement 4 chiffres (ex: 1234)');
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(resetSpy).not.toHaveBeenCalled();
    });

    it('should reset the error and the display if room id is a number', () => {
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        spyOn<any>(component, 'isOnlyDigit').and.callFake(() => {
            return true;
        });
        component['roomIdClientValidation']();
        expect(component.error).toBeUndefined();
        expect(resetSpy).toHaveBeenCalled();
        expect(showErrorFeedbackSpy).not.toHaveBeenCalled();
    });

    it('should return false if roomId does not match 4 digit code', () => {
        component.roomId = 'abcd';
        const result = component['isOnlyDigit']();
        expect(result).toBeFalsy();
    });

    it('should return true if roomId match 4 digit code', () => {
        component.roomId = '1234';
        const result = component['isOnlyDigit']();
        expect(result).toBeTruthy();
    });

    it('should try and send an event when player trying to join room', fakeAsync(() => {
        const sendSpy = spyOn(socketService, 'send');
        component.roomId = '1234';
        component.username = 'test';
        component.isLocked = false;
        component.isRoomIdValid = true;
        component['sendJoinRoomRequest']();
        expect(sendSpy).toHaveBeenCalled();
    }));

    it('should deny player entry if room is locked', fakeAsync(() => {
        spyOn<any>(component, 'sendRoomId').and.returnValue(Promise.resolve());
        const sendSpy = spyOn<any>(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isLocked = false;
        component.isRoomIdValid = true;
        component['sendJoinRoomRequest']();
        tick();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('player join');
        expect(data).toEqual({ roomId: Number(component.roomId), username: component.username });
        if (typeof callback === 'function') {
            callback(true);
            expect(component.isLocked).toBeTruthy();
            expect(showErrorFeedbackSpy).toHaveBeenCalled();
            expect(resetSpy).not.toHaveBeenCalled();
        }
    }));

    it('should deny player entry if room is locked', fakeAsync(() => {
        spyOn<any>(component, 'sendRoomId').and.returnValue(Promise.resolve());
        const sendSpy = spyOn<any>(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isLocked = false;
        component.isRoomIdValid = true;
        component['sendJoinRoomRequest']();
        tick();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('player join');
        expect(data).toEqual({ roomId: Number(component.roomId), username: component.username });
        if (typeof callback === 'function') {
            callback(false);
            expect(component.isLocked).toBeFalsy();
            expect(showErrorFeedbackSpy).not.toHaveBeenCalled();
            expect(resetSpy).toHaveBeenCalled();
        }
    }));

    it('should display error if username not valid after server validation', async () => {
        spyOn<any>(component, 'sendRoomId').and.returnValue(Promise.resolve());
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isUsernameValid = false;
        component.isRoomIdValid = true;
        await component['sendUsername']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('validate username');
        expect(data).toEqual({ roomId: Number(component.roomId), username: component.username });
        if (typeof callback === 'function') {
            callback({ isValid: false, error: 'server error' });
            expect(component.isUsernameValid).toBeFalsy();
            expect(component.error).toEqual('server error');
            expect(showErrorFeedbackSpy).toHaveBeenCalled();
            expect(resetSpy).not.toHaveBeenCalled();
        }
    });

    it('should pass to next step if username is valid on server side', async () => {
        spyOn<any>(component, 'sendRoomId').and.returnValue(Promise.resolve());
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isUsernameValid = false;
        component.isRoomIdValid = true;
        await component['sendUsername']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('validate username');
        expect(data).toEqual({ roomId: Number(component.roomId), username: component.username });
        if (typeof callback === 'function') {
            callback({ isValid: true, error: 'server error' });
            expect(component.isUsernameValid).toBeTruthy();
            expect(showErrorFeedbackSpy).not.toHaveBeenCalled();
            expect(resetSpy).toHaveBeenCalled();
        }
    });

    it('should display error if roomId is locked after server validation', fakeAsync(() => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component['sendRoomId']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('validate roomID');
        expect(data).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback({ isRoom: true, isLocked: true });
            expect(component.isRoomIdValid).toBeFalsy();
            expect(showErrorFeedbackSpy).toHaveBeenCalled();
            expect(resetSpy).not.toHaveBeenCalled();
            expect(component.error).toEqual('La partie est vérouillée. Veuillez réessayer.');
        }
    }));

    it('should move to the next step if roomId is valid on server side', fakeAsync(() => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        const resetSpy = spyOn<any>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isRoomIdValid = false;
        component['sendRoomId']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('validate roomID');
        expect(data).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback({ isRoom: true, isLocked: false });
            expect(component.isRoomIdValid).toBeTruthy();
            expect(showErrorFeedbackSpy).not.toHaveBeenCalled();
            expect(resetSpy).toHaveBeenCalled();
            expect(component.error).toBeUndefined();
        }
    }));

    it('should reset room prompt component if roomId does not exist', fakeAsync(() => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<any>(component, 'showErrorFeedback');
        component.roomId = '1234';
        component.username = 'test';
        component.isRoomIdValid = false;
        component['sendRoomId']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('validate roomID');
        expect(data).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback({ isRoom: false, isLocked: false });
            expect(component.isRoomIdValid).toBeFalsy();
            expect(component.isUsernameValid).toBeFalsy();
            expect(showErrorFeedbackSpy).toHaveBeenCalled();
            expect(component.error).toEqual('Le code ne correspond a aucune partie en cours. Veuillez réessayer');
        }
    }));

    it('should reset all feedback error', () => {
        component['reset']();
        expect(component.textColor).toEqual('');
        expect(component.inputBorderColor).toEqual('');
        expect(component.error).toEqual('');
    });

    it('should show all feedback error', () => {
        component['showErrorFeedback']();
        expect(component.textColor).toEqual('red-text');
        expect(component.inputBorderColor).toEqual('red-border');
    });
});
