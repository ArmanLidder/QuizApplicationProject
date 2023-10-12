import { RoomCodePromptComponent } from './room-code-prompt.component';
import { SocketClientService } from '@app/services/socket-client.service';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { TestBed } from '@angular/core/testing';

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

    it('should send room id to server only if room id is a number', () => {
        const roomIdClientValidationSpy = spyOn<unknown>(component, 'roomIdClientValidation');
        const sendRoomIdSpy = spyOn<unknown>(component, 'sendRoomId');
        spyOn<unknown>(component, 'isOnlyDigit').and.callFake(() => {
            return true;
        });
        component.validateRoomId();
        expect(sendRoomIdSpy).toHaveBeenCalled();
        expect(roomIdClientValidationSpy).not.toHaveBeenCalled();
    });

    it('should not send room id to server and display error if room id is not a number', () => {
        const roomIdClientValidationSpy = spyOn<unknown>(component, 'roomIdClientValidation');
        const sendRoomIdSpy = spyOn<unknown>(component, 'sendRoomId');
        spyOn<unknown>(component, 'isOnlyDigit').and.callFake(() => {
            return false;
        });
        component.validateRoomId();
        expect(sendRoomIdSpy).not.toHaveBeenCalled();
        expect(roomIdClientValidationSpy).toHaveBeenCalled();
    });

    it('should not accept empty username', () => {
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        component.username = '';
        component.validateUsername();
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(component.error).toEqual("Le nom de l'utilisateur doit contenir au moins un caractère!");
    });

    it('should not accept only whitespace in username', () => {
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        component.username = ' ';
        component.validateUsername();
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(component.error).toEqual("Le nom de l'utilisateur doit contenir au moins un caractère!");
    });

    it('should not accept organisateur as username', () => {
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        component.username = 'Organisateur';
        component.validateUsername();
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(component.error).toEqual("Le nom de l'utilisateur ne peut pas être Organisateur!");
    });

    it('should send username if it passes client side validation', () => {
        const sendUsernameSpy = spyOn<unknown>(component, 'sendUsername');
        const resetSpy = spyOn<unknown>(component, 'reset');
        component.username = 'test';
        component.validateUsername();
        expect(sendUsernameSpy).toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('should not access room if room is locked', () => {
        const sendJoinRoomRequestSpy = spyOn<unknown>(component, 'sendJoinRoomRequest');
        const sendRoomIdToWaitingRoomSpy = spyOn(component, 'sendRoomIdToWaitingRoom');
        const sendValidationDoneSpy = spyOn(component, 'sendValidationDone');
        component.isLocked = false;
        component.joinRoom();
        expect(sendJoinRoomRequestSpy).toHaveBeenCalled();
        expect(sendRoomIdToWaitingRoomSpy).not.toHaveBeenCalled();
        expect(sendValidationDoneSpy).not.toHaveBeenCalled();
        expect(component.isActive).toBeTruthy();
    });

    it('should access room if room is not locked', () => {
        const sendJoinRoomRequestSpy = spyOn<unknown>(component, 'sendJoinRoomRequest');
        const sendRoomIdToWaitingRoomSpy = spyOn(component, 'sendRoomIdToWaitingRoom');
        const sendValidationDoneSpy = spyOn(component, 'sendValidationDone');
        component.isLocked = true;
        component.joinRoom();
        expect(sendJoinRoomRequestSpy).toHaveBeenCalled();
        expect(sendRoomIdToWaitingRoomSpy).toHaveBeenCalled();
        expect(sendValidationDoneSpy).toHaveBeenCalled();
        expect(component.isActive).toBeFalsy();
    });

    it('should set the error and display if room id is not a number', () => {
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        spyOn<unknown>(component, 'isOnlyDigit').and.callFake(() => {
            return false;
        });
        component['roomIdClientValidation']();
        expect(component.error).toEqual('Votre code doit contenir seulement 4 chiffres (ex: 1234)');
        expect(showErrorFeedbackSpy).toHaveBeenCalled();
        expect(resetSpy).not.toHaveBeenCalled();
    });

    it('should reset the error and the display if room id is a number', () => {
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        spyOn<unknown>(component, 'isOnlyDigit').and.callFake(() => {
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

    it('should try and send an event when player trying to join room', () => {
        const sendSpy = spyOn(socketService, 'send');
        component.roomId = '1234';
        component.username = 'test';
        component.isLocked = false;
        component['sendJoinRoomRequest']();
        expect(sendSpy).toHaveBeenCalled();
    });

    it('should deny player entry if room is locked', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isLocked = false;
        component['sendJoinRoomRequest']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('player join');
        expect(data).toEqual({ roomId: Number(component.roomId), username: component.username });
        if (typeof callback === 'function') {
            callback(true);
            expect(component.isLocked).toBeTruthy();
            expect(showErrorFeedbackSpy).toHaveBeenCalled();
            expect(resetSpy).not.toHaveBeenCalled();
        }
    });

    it('should accept player entry if room is not locked', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isLocked = false;
        component['sendJoinRoomRequest']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('player join');
        expect(data).toEqual({ roomId: Number(component.roomId), username: component.username });
        if (typeof callback === 'function') {
            callback(false);
            expect(component.isLocked).toBeFalsy();
            expect(showErrorFeedbackSpy).not.toHaveBeenCalled();
            expect(resetSpy).toHaveBeenCalled();
        }
    });

    it('should display error if username not valid after server validation', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isUsernameValid = false;
        component['sendUsername']();
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

    it('should pass to next step if username is valid on server side', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isUsernameValid = false;
        component['sendUsername']();
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

    it('should display error if roomId not valid after server validation', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isRoomIdValid = false;
        component['sendRoomId']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('validate roomID');
        expect(data).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback(false);
            expect(component.isRoomIdValid).toBeFalsy();
            expect(showErrorFeedbackSpy).toHaveBeenCalled();
            expect(resetSpy).not.toHaveBeenCalled();
            expect(component.error).toEqual('Le code ne correspond a aucune partie en cours. Veuillez réessayer');
        }
    });

    it('should move to the next step if roomId is valid on server side', () => {
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        const showErrorFeedbackSpy = spyOn<unknown>(component, 'showErrorFeedback');
        const resetSpy = spyOn<unknown>(component, 'reset');
        component.roomId = '1234';
        component.username = 'test';
        component.isRoomIdValid = false;
        component['sendRoomId']();
        const [event, data, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('validate roomID');
        expect(data).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback(true);
            expect(component.isRoomIdValid).toBeTruthy();
            expect(showErrorFeedbackSpy).not.toHaveBeenCalled();
            expect(resetSpy).toHaveBeenCalled();
            expect(component.error).toBeUndefined();
        }
    });

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
