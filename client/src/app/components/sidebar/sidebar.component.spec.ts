import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { SocketClientServiceTestHelper } from '@app/classes/socket-client-service-test-helper';
import { ActivatedRoute } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Message } from '@common/interfaces/message.interface';
import { getCurrentDateService } from 'src/utils/current-date-format';
import SpyObj = jasmine.SpyObj;
import { GameService } from '@app/services/game.service/game.service';

const MESSAGE_MAX_CHARACTERS = 200;
/* eslint-disable  @typescript-eslint/no-explicit-any */
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let socketService: SocketClientServiceTestHelper;
    let formBuilder: FormBuilder;
    let gameService: SpyObj<GameService>;
    let longMessage: string;
    beforeEach(() => {
        gameService = jasmine.createSpyObj('GameService', ['destroy']);
        TestBed.configureTestingModule({
            declarations: [SidebarComponent],
            imports: [ReactiveFormsModule, FormsModule],
            providers: [
                { provide: SocketClientService, useClass: SocketClientServiceTestHelper },
                FormBuilder,
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
                { provide: GameService, useValue: gameService },
            ],
        });
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        socketService = TestBed.inject(SocketClientService) as unknown as SocketClientServiceTestHelper;
        spyOn(socketService, 'isSocketAlive').and.callFake(() => {
            return true;
        });
        formBuilder = TestBed.inject(FormBuilder);
        // gameService = TestBed.inject(GameService) as unknown as SpyObj<GameService>;
        fixture.detectChanges();
    });

    beforeEach(() => {
        longMessage =
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum pretium euismod urna, ' +
            'ut aliquam ligula. Nulla bibendum, nunc nec laoreet bibendum, arcu elit bibendum sapien....' +
            '.....................\n';
        component.messageForm = formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize roomId and messageForm when a roomId is provided', () => {
        spyOn<any>(component, 'getRoomMessages');
        spyOn<any>(component, 'configureBaseSocketFeatures');
        spyOn<any>(component, 'getUsername');

        expect(component.roomId).toBe('1');
        expect(component.messageForm).toBeDefined();
    });

    it('should set isInputFocused to true when calling onChatFocus', () => {
        component.onChatFocus();
        expect(gameService.isInputFocused).toBeTruthy();
    });

    it('should set isInputFocused to false when calling onChatBlur', () => {
        component.onChatBlur();
        expect(gameService.isInputFocused).toBeFalsy();
    });

    it('should call getUsername() when setting up the chat', () => {
        const getUsernameSpy = spyOn<any>(component, 'getUsername');
        component['setup']();
        expect(getUsernameSpy).toHaveBeenCalled();
    });

    it('should call getRoomMessages() and configureBaseSocketFeatures()', () => {
        const getRoomMessagesSpy = spyOn(component, 'getRoomMessages' as any);
        const configureSocketsSpy = spyOn(component, 'configureBaseSocketFeatures' as any);
        component['setup']();
        expect(getRoomMessagesSpy).toHaveBeenCalled();
        expect(configureSocketsSpy).toHaveBeenCalled();
    });

    it('should send a new message when the message is valid and not empty', () => {
        spyOn(socketService, 'send');
        spyOn(component.messageForm.get('message') as FormControl, 'setValue').and.callThrough();
        component.roomId = '1234';
        component.myName = 'TestUser';
        const newValidMessageContent = 'Hello, World';
        component.messageForm = formBuilder.group({
            message: [newValidMessageContent, [Validators.required, Validators.maxLength(MESSAGE_MAX_CHARACTERS)]],
        });
        component.sendMessage();

        const expectedMessage = {
            sender: 'TestUser',
            content: newValidMessageContent,
            time: getCurrentDateService(),
        };
        expect(socketService.send).toHaveBeenCalledWith('new message', {
            roomId: Number(component.roomId),
            message: expectedMessage,
        });
    });

    it('should not send a message when the message is invalid', () => {
        spyOn(socketService, 'send');
        const messageControl = component.messageForm.get('message') as FormControl;
        messageControl.setValue('');
        component.sendMessage();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should not send a message when the message is empty', () => {
        spyOn(socketService, 'send');
        const messageControl = component.messageForm.get('message') as FormControl;
        messageControl.setValue('      ');
        component.sendMessage();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should not send a message when the message length is above 200 characters', () => {
        spyOn(socketService, 'send');
        const messageControl = component.messageForm.get('message') as FormControl;
        messageControl.setValue(longMessage);
        component.sendMessage();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should set myName when getting username', () => {
        const username = 'User 1';
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component['getUsername']();
        const [event, roomId, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('get username');
        expect(roomId).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback(username);
            expect(component.myName).toEqual(username);
        }
    });

    it('should get messages related to a room', () => {
        const roomMessages: Message[] = [
            { sender: 'user 1', content: 'message content 1', time: 'time 1' },
            { sender: 'user 2', content: 'message content 2', time: 'time 2' },
        ];
        const sendSpy = spyOn(socketService, 'send').and.callThrough();
        component['getRoomMessages']();
        const [event, roomId, callback] = sendSpy.calls.mostRecent().args;
        expect(event).toEqual('get messages');
        expect(roomId).toEqual(Number(component.roomId));
        if (typeof callback === 'function') {
            callback(roomMessages);
            expect(component.messages).toEqual(roomMessages);
        }
        component['getRoomMessages']();
        if (typeof callback === 'function') {
            callback(undefined);
            expect(component.messages).toEqual([]);
        }
    });

    it('should configure the right socket event listener', () => {
        const onSpy = spyOn(socketService, 'on').and.callThrough();
        const newMessage: Message = { sender: 'user 2', content: 'message content 2', time: 'time 2' };
        component['messages'] = [{ sender: 'user 1', content: 'message content 1', time: 'time 1' }];
        component['configureBaseSocketFeatures']();
        const [[firstEvent, firstAction]] = onSpy.calls.allArgs();
        expect(firstEvent).toEqual('message received');

        if (typeof firstAction === 'function') {
            firstAction(newMessage);
            expect(component['messages']).toEqual([
                { sender: 'user 1', content: 'message content 1', time: 'time 1' },
                { sender: 'user 2', content: 'message content 2', time: 'time 2' },
            ]);
        }
    });
});
