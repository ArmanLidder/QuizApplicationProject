import { Server } from 'app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service';
import { SinonStubbedInstance } from 'sinon';
import { RoomData, RoomManagingService } from '@app/services/room-managing.service';
import { Message } from '@common/interfaces/message.interface';
import { fillerQuizzes } from '@app/mock-data/data';
import { Game } from '@app/classes/game';

const RESPONSE_DELAY = 200;

describe('SocketManager service tests', () => {
    const TIME_VALUE = 5;
    const FIVE_SECOND = 5000;
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';
    let roomManager: SinonStubbedInstance<RoomManagingService>;
    const mockRoomId = 1000;
    const mockUsername = 'mockUsername';
    const mockMessages: Message[] = [{ sender: 'user 1', content: 'message 1', time: 'time 1' }];
    let mockRoom: RoomData;
    let gameMock: sinon.SinonStubbedInstance<Game>;
    beforeEach(async () => {
        gameMock = sinon.createStubInstance(Game);
        gameMock.quiz = fillerQuizzes[0];
        gameMock.currentQuizQuestion = fillerQuizzes[0].questions[0];
        gameMock.players = new Map();
        gameMock.playersAnswers = new Map();
        gameMock.players.set('test', { points: 0, bonusCount: 0, isBonus: false });
        mockRoom = {
            room: mockRoomId,
            quizID: 'quiz123',
            players: new Map([
                ['Organisateur', 'socket organisateur'],
                ['username1', 'socketId1'],
                ['username2', 'socketId2'],
            ]),
            locked: false,
            game: gameMock,
            bannedNames: ['John', 'Alice'],
            messages: mockMessages,
            timer: null,
        };
        server = Container.get(Server);
        await server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
        roomManager = sinon.createStubInstance(RoomManagingService);
        roomManager['rooms'] = new Map([[mockRoomId, mockRoom]]);
        roomManager.addRoom.returns(mockRoomId);
        roomManager.getRoomById.returns(mockRoom);
        roomManager.getGameByRoomId.returns(gameMock);
        service['roomManager'] = roomManager;
        sinon.stub(console, 'log');
    });
    afterEach(() => {
        clientSocket.disconnect();
        clientSocket.close();
        service['sio'].close();
        sinon.restore();
    });
    it('should set up event handlers when calling handleSockets', (done) => {
        clientSocket.on('hello', (args) => {
            assert.equal(args, 'Hello World!');
            done();
        });
    });
    it('should handle a create Room event and return a room code', (done) => {
        const clientCallBack = (roomCode: number) => {
            expect(roomCode).to.equal(mockRoomId);
            done();
        };
        clientSocket.emit('create Room', 'test', clientCallBack);
    });
    it('should handle a "player join" event when room is locked', (done) => {
        roomManager.isRoomLocked.returns(true);
        const clientCallBack = (isLocked: boolean) => {
            expect(isLocked).to.equal(true);
            done();
        };
        clientSocket.emit('player join', { roomId: mockRoomId, username: mockUsername }, clientCallBack);
    });
    it('should handle a "player join" event when room is unlocked', (done) => {
        roomManager.getUsernamesArray.returns(['username1', 'username2']);
        const expectedPlayers = roomManager.getUsernamesArray(mockRoomId);
        roomManager.isRoomLocked.returns(false);
        const clientCallBack = (isLocked: boolean) => {
            expect(isLocked).to.equal(false);
            expect(roomManager.addUser.called);
        };
        clientSocket.emit('player join', { roomId: mockRoomId, username: mockUsername }, clientCallBack);
        clientSocket.on('new player', (players: string[]) => {
            expect(players).to.deep.equal(expectedPlayers);
            done();
        });
    });
    it('should handle a player ban', (done) => {
        const spy = sinon.spy(service['sio'], 'to');
        roomManager.getSocketIDByUsername.returns('Test');
        clientSocket.emit('ban player', { roomId: mockRoomId, username: mockUsername });
        setTimeout(() => {
            assert(spy.calledWith(String(mockRoomId)));
            assert(spy.calledWith('Test'));
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle a room lock toggle', (done) => {
        clientSocket.emit('show result', mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle a room lock toggle', (done) => {
        const initialLockState = mockRoom.locked;
        roomManager.changeLockState.callsFake(() => {
            mockRoom.locked = !mockRoom.locked;
        });
        clientSocket.emit('toggle room lock', mockRoomId);
        setTimeout(() => {
            const finalLockState = mockRoom.locked;
            expect(initialLockState).to.not.equal(finalLockState);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle a "validate username" event when name already in use', (done) => {
        roomManager.isNameUsed.returns(true);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(false);
            expect(data.error).to.equal('Le nom choisi est déjà utiliser. Veuillez choisir un autre.');
            done();
        };
        clientSocket.emit('validate username', { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should handle a "validate username" event when name is banned', (done) => {
        roomManager.isNameUsed.returns(false);
        roomManager.isNameBanned.returns(true);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(false);
            expect(data.error).to.equal('Vous avez été banni du lobby et vous ne pouvez plus rentrez.');
            done();
        };
        clientSocket.emit('validate username', { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should handle a "validate username" event when name is unused and not banned', (done) => {
        roomManager.isNameUsed.returns(false);
        roomManager.isNameBanned.returns(false);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(true);
            done();
        };
        clientSocket.emit('validate username', { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should validate good roomID properly', (done) => {
        const clientCallBack = (isValid: boolean) => {
            expect(isValid).to.deep.equal({ isRoom: true, isLocked: false });
            done();
        };
        clientSocket.emit('validate roomID', mockRoomId, clientCallBack);
    });
    it('should validate bad roomID properly', (done) => {
        const badRoomID = 123;
        const clientCallBack = (isValid: boolean) => {
            expect(isValid).to.deep.equal({ isRoom: false, isLocked: false });
            done();
        };
        clientSocket.emit('validate roomID', badRoomID, clientCallBack);
    });
    it('should handle "gather players username" event', (done) => {
        const players = Array.from(mockRoom?.players.keys());
        roomManager.getUsernamesArray.returns(players);
        const clientCallback = (playerNames: string[]) => {
            expect(playerNames).to.deep.equal(players);
            done();
        };
        clientSocket.emit('gather players username', mockRoomId, clientCallback);
    });
    it('should handle "player abandonment" event when undefined', (done) => {
        roomManager.removeUserBySocketID.returns(undefined);
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit('player abandonment', mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.notCalled);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when defined', (done) => {
        roomManager.removeUserBySocketID.returns({ roomId: mockRoomId, username: 'username1' });
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit('player abandonment', mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "host abandonment" event when defined', (done) => {
        roomManager.deleteRoom.callsFake((roomId) => {
            roomManager['rooms'].delete(roomId);
        });
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        const disconnectSpy = sinon.spy(service['sio'].sockets, 'disconnectSockets');
        clientSocket.emit('host abandonment', mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            expect(roomManager['rooms'].has(mockRoomId)).to.equal(false);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "start" event', (done) => {
        const mockTime = 123;
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const timerFunctionSpy = sinon.spy(service, 'timerFunction' as any);
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        clientSocket.emit('start', { roomId: mockRoomId, time: mockTime });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernamesArray.called);
            expect(timerFunctionSpy.calledWith(mockRoomId, mockTime));
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "get messages" event', (done) => {
        roomManager.getRoomById.returns(mockRoom);
        const clientCallback = (messages: string[]) => {
            expect(messages).to.deep.equal(mockMessages);
            done();
        };
        clientSocket.emit('get messages', mockRoomId, clientCallback);
    });
    it('should handle "get messages" event if messages is undefined', (done) => {
        roomManager.getRoomById.returns(undefined);
        const clientCallback = (messages?: string[]) => {
            expect(messages).to.equal(null);
            done();
        };
        clientSocket.emit('get messages', mockRoomId, clientCallback);
    });
    it('should handle "get username" event', (done) => {
        roomManager.getUsernameBySocketId.returns(mockUsername);
        const clientCallback = (username: string) => {
            expect(roomManager.getSocketIDByUsername.calledWith(mockRoomId, clientSocket.id));
            expect(username).to.deep.equal(mockUsername);
            done();
        };
        clientSocket.emit('get username', mockRoomId, clientCallback);
    });
    it('should handle "new message" event', (done) => {
        const newMessage: Message = { sender: 'user1', content: 'New message', time: 'time 1' };
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        setTimeout(() => {
            expect(emitSpy.called);
            expect(emitSpy.calledWith('message received'));
            expect(roomManager.addMessage.calledWith(mockRoomId, newMessage)).to.equal(true);
            done();
        }, RESPONSE_DELAY);
        clientSocket.emit('new message', { roomId: mockRoomId, message: newMessage });
    });
    it('should emit time and clear timer when time is over', (done) => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const emitSpy = sinon.spy(service, 'emitTime' as any);
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        const setIntervalSpy = sinon.spy(setInterval);
        service['timerFunction'](mockRoomId, TIME_VALUE);
        setTimeout(() => {
            expect(emitSpy.callCount).to.equal(TIME_VALUE);
            expect(roomManager.clearRoomTimer.called);
            expect(setIntervalSpy.called);
            done();
        }, FIVE_SECOND);
    });
    it('should emit get initial question and set timer', (done) => {
        roomManager.getUsernameBySocketId.returns('Organisateur');
        clientSocket.emit('get question', mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernameBySocketId.called);
            expect(roomManager.clearRoomTimer.called);
            // expect(service['timerFunction'].called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle submit answer', (done) => {
        gameMock.players = new Map();
        const mockAnswers = ['one', 'two'];
        const mockTimer = 123;
        clientSocket.emit('submit answer', { mockRoomId, mockAnswers, mockTimer, mockUsername });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should start transition by clearing room  and setting timer', (done) => {
        clientSocket.emit('start transition', mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should get score and callback playerScore', (done) => {
        const callback = () => {
            return;
        };
        clientSocket.emit('get score', { roomId: mockRoomId, username: 'test' }, callback);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle next question properly', (done) => {
        clientSocket.emit('next question', mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle update selection', (done) => {
        roomManager.getSocketIDByUsername.returns('test');
        gameMock.choicesStats = new Map();
        const mockIsSelected = true;
        const mockIndex = 1;
        clientSocket.emit('update selection', { mockRoomId, mockIsSelected, mockIndex });
        setTimeout(() => {
            expect(roomManager.getSocketIDByUsername.calledWith(mockRoomId, 'Organisateur'));
            done();
        }, RESPONSE_DELAY);
    });
});
