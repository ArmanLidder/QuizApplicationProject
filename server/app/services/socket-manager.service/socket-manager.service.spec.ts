/* eslint-disable max-lines */
import { Server } from '@app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { SinonStubbedInstance } from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service/socket-manager.service';
import { RoomData, RoomManagingService } from '@app/services/room-managing.service/room-managing.service';
import { Message } from '@common/interfaces/message.interface';
import { fillerQuizzes } from '@app/mock-data/data';
import { Game } from '@app/classes/game/game';
import { Answers } from '@app/interface/game-interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { QRL_DURATION } from '@app/services/socket-manager.service/socket-manager.service.const';
import { QuestionType } from '@common/enums/question-type.enum';

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
        sinon.stub(console, 'log');
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
    });
    afterEach(() => {
        clientSocket.disconnect();
        clientSocket.close();
        service['sio'].close();
        sinon.restore();
    });
    it('should handle a create Room event and return a room code', (done) => {
        const clientCallBack = (roomCode: number) => {
            expect(roomCode).to.equal(mockRoomId);
            done();
        };
        clientSocket.emit(socketEvent.createRoom, 'test', clientCallBack);
    });
    it('should handle a "player join" event when room is locked', (done) => {
        roomManager.isRoomLocked.returns(true);
        const clientCallBack = (isLocked: boolean) => {
            expect(isLocked).to.equal(true);
            done();
        };
        clientSocket.emit(socketEvent.joinGame, { roomId: mockRoomId, username: mockUsername }, clientCallBack);
    });
    it('should handle a "player join" event when room is unlocked', (done) => {
        roomManager.getUsernamesArray.returns(['username1', 'username2']);
        const expectedPlayers = roomManager.getUsernamesArray(mockRoomId);
        roomManager.isRoomLocked.returns(false);
        const clientCallBack = (isLocked: boolean) => {
            expect(isLocked).to.equal(false);
            expect(roomManager.addUser.called);
            done();
        };
        clientSocket.emit(socketEvent.joinGame, { roomId: mockRoomId, username: mockUsername }, clientCallBack);
        clientSocket.on(socketEvent.newPlayer, (players: string[]) => {
            expect(players).to.deep.equal(expectedPlayers);
            done();
        });
    });
    it('should handle a player ban', (done) => {
        const spy = sinon.spy(service['sio'], 'to');
        roomManager.getSocketIDByUsername.returns('Test');
        clientSocket.emit(socketEvent.banPlayer, { roomId: mockRoomId, username: mockUsername });
        setTimeout(() => {
            assert(spy.calledWith(String(mockRoomId)));
            assert(spy.calledWith('Test'));
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle a room lock toggle', (done) => {
        clientSocket.emit(socketEvent.toggleRoomLock, mockRoomId);
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
        clientSocket.emit(socketEvent.toggleRoomLock, mockRoomId);
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
        clientSocket.emit(socketEvent.validateUsername, { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should handle a "validate username" event when name is banned', (done) => {
        roomManager.isNameUsed.returns(false);
        roomManager.isNameBanned.returns(true);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(false);
            expect(data.error).to.equal('Vous avez été banni du lobby et vous ne pouvez plus rentrez.');
            done();
        };
        clientSocket.emit(socketEvent.validateUsername, { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should handle a "validate username" event when name is unused and not banned', (done) => {
        roomManager.isNameUsed.returns(false);
        roomManager.isNameBanned.returns(false);
        const clientCallBack = (data: { isValid: boolean; error: string }) => {
            expect(data.isValid).to.equal(true);
            done();
        };
        clientSocket.emit(socketEvent.validateUsername, { mockRoomId, mockUsername }, clientCallBack);
    });
    it('should validate good roomID properly', (done) => {
        const clientCallBack = (isValid: boolean) => {
            expect(isValid).to.deep.equal({ isRoom: true, isLocked: false });
            done();
        };
        clientSocket.emit(socketEvent.validateRoomId, mockRoomId, clientCallBack);
    });
    it('should validate bad roomID properly', (done) => {
        const badRoomID = 123;
        const clientCallBack = (isValid: boolean) => {
            expect(isValid).to.deep.equal({ isRoom: false, isLocked: false });
            done();
        };
        clientSocket.emit(socketEvent.validateRoomId, badRoomID, clientCallBack);
    });
    it('should handle "gather players username" event', (done) => {
        const players = Array.from(mockRoom?.players.keys());
        roomManager.getUsernamesArray.returns(players);
        const clientCallback = (playerNames: string[]) => {
            expect(playerNames).to.deep.equal(players);
            done();
        };
        clientSocket.emit(socketEvent.gatherPlayersUsername, mockRoomId, clientCallback);
    });
    it('should handle "show result" event', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTimerStub = sinon.spy(service, 'startTimer' as any);
        clientSocket.emit(socketEvent.showResult, mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            expect(startTimerStub.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when undefined', (done) => {
        roomManager.removeUserBySocketID.returns(undefined);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(socketEvent.playerLeft, mockRoomId);
        setTimeout(() => {
            expect(emitSpy.notCalled);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when defined', (done) => {
        const answer: Answers = { answers: ['1'], time: 10 };
        roomManager.removeUserBySocketID.returns({ roomId: mockRoomId, username: 'username1' });
        gameMock.playersAnswers.set('test', answer);
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(socketEvent.playerLeft, mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when game undefined', (done) => {
        const answer: Answers = { answers: ['1'], time: 10 };
        roomManager.removeUserBySocketID.returns({ roomId: mockRoomId, username: 'username1' });
        gameMock.playersAnswers.set('test', answer);
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        roomManager.getGameByRoomId.returns(undefined);
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(socketEvent.playerLeft, mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "player abandonment" event when players length = 0', (done) => {
        const disconnectSpy = sinon.stub(clientSocket, 'disconnect').returns(null);
        roomManager.removeUserBySocketID.returns({ roomId: mockRoomId, username: 'username1' });
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(socketEvent.playerLeft, mockRoomId);
        setTimeout(() => {
            expect(disconnectSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should call final time transition when every player abandoned', (done) => {
        gameMock.players.clear();
        roomManager.removeUserBySocketID.returns({ roomId: mockRoomId, username: 'username1' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTimerSpy = sinon.spy(service, 'startTimer' as any);
        // eslint-enaable-next-line @typescript-eslint/no-explicit-any
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(socketEvent.playerLeft, mockRoomId);
        setTimeout(() => {
            expect(startTimerSpy.called);
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle "host abandonment" event when defined', (done) => {
        roomManager.deleteRoom.callsFake((roomId) => {
            roomManager['rooms'].delete(roomId);
        });
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        clientSocket.emit(socketEvent.hostLeft, mockRoomId);
        setTimeout(() => {
            expect(emitSpy.called);
            expect(roomManager['rooms'].has(mockRoomId)).to.equal(false);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "start" event', (done) => {
        const mockTime = 123;
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const startTimerSpy = sinon.spy(service, 'startTimer' as any);
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        const players = Array.from(mockRoom.players.keys());
        players.splice(players.indexOf('Organisateur'), 1);
        roomManager.getUsernamesArray.returns(players);
        roomManager.getRoomById.returns(mockRoom);
        sinon.stub(Game.prototype, 'setup').resolves();
        clientSocket.emit(socketEvent.start, { roomId: mockRoomId, time: mockTime });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernamesArray.called);
            expect(startTimerSpy.calledWith(mockRoomId, mockTime));
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle "get messages" event', (done) => {
        roomManager.getRoomById.returns(mockRoom);
        const clientCallback = (messages: string[]) => {
            expect(messages).to.deep.equal(mockMessages);
            done();
        };
        clientSocket.emit(socketEvent.getMessages, mockRoomId, clientCallback);
    });
    it('should handle "get messages" event if messages is undefined', (done) => {
        roomManager.getRoomById.returns(undefined);
        const clientCallback = (messages?: string[]) => {
            expect(messages).to.equal(null);
            done();
        };
        clientSocket.emit(socketEvent.getMessages, mockRoomId, clientCallback);
    });
    it('should handle "get username" event', (done) => {
        roomManager.getUsernameBySocketId.returns(mockUsername);
        const clientCallback = (username: string) => {
            expect(roomManager.getSocketIDByUsername.calledWith(mockRoomId, clientSocket.id));
            expect(username).to.deep.equal(mockUsername);
            done();
        };
        clientSocket.emit(socketEvent.getUsername, mockRoomId, clientCallback);
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
        clientSocket.emit(socketEvent.newMessage, { roomId: mockRoomId, message: newMessage });
    });
    it('should emit time and clear timer when time is over', (done) => {
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        const emitSpy = sinon.spy(service, 'emitTime' as any);
        /* eslint-enable  @typescript-eslint/no-explicit-any */
        const setIntervalSpy = sinon.spy(setInterval);
        service['startTimer'](mockRoomId, TIME_VALUE);
        setTimeout(() => {
            expect(emitSpy.callCount).to.equal(TIME_VALUE);
            expect(roomManager.clearRoomTimer.called);
            expect(setIntervalSpy.called);
            done();
        }, FIVE_SECOND);
    });
    it('should emit get initial question and set timer for a qcm', (done) => {
        gameMock.currentQuizQuestion = gameMock.quiz.questions[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTimerStub = sinon.spy(service, 'startTimer' as any);
        roomManager.getUsernameBySocketId.returns('Organisateur');
        clientSocket.emit(socketEvent.getQuestion, mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernameBySocketId.called);
            expect(roomManager.clearRoomTimer.called);
            expect(startTimerStub.calledWith(mockRoomId, gameMock.quiz.duration));
            done();
        }, RESPONSE_DELAY);
    });

    it('should emit get initial question and set timer for a qrl', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTimerStub = sinon.spy(service, 'startTimer' as any);
        roomManager.getUsernameBySocketId.returns('Organisateur');
        gameMock.currentQuizQuestion = gameMock.quiz.questions[1];
        clientSocket.emit(socketEvent.getQuestion, mockRoomId);
        setTimeout(() => {
            expect(startTimerStub.calledWith(mockRoomId, QRL_DURATION));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle when Organizer not found', (done) => {
        roomManager.getUsernameBySocketId.returns(undefined);
        clientSocket.emit(socketEvent.getQuestion, mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.getUsernameBySocketId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle submit answer when timer is 0 when its a qcm', (done) => {
        gameMock.players = new Map();
        const mockAnswers = ['one', 'two'];
        const mockTimer = 0;
        clientSocket.emit(socketEvent.submitAnswer, { roomId: mockRoomId, answers: mockAnswers, timer: mockTimer, username: mockUsername });
        setTimeout(() => {
            expect(roomManager.getSocketIDByUsername.called);
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle submit answer when timer is 0 when its a qrl', (done) => {
        gameMock.players = new Map();
        const mockAnswers = ['one', 'two'];
        const mockTimer = 0;
        gameMock.currentQuizQuestion = gameMock.quiz.questions[1];
        clientSocket.emit(socketEvent.submitAnswer, { roomId: mockRoomId, answers: mockAnswers, timer: mockTimer, username: mockUsername });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.notCalled);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle submit answer when timer is more than 0', (done) => {
        gameMock.players = new Map();
        const mockAnswers = ['one', 'two'];
        const mockTimer = 123; // Set to a value other than 0
        clientSocket.emit(socketEvent.submitAnswer, { mockRoomId, mockAnswers, mockTimer, mockUsername });
        setTimeout(() => {
            expect(roomManager.getSocketIDByUsername.called);
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should handle submit answer when length not equal', (done) => {
        const mockAnswers = ['one', 'two'];
        const mockTimer = 123;
        clientSocket.emit(socketEvent.submitAnswer, { mockRoomId, mockAnswers, mockTimer, mockUsername });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should start transition by clearing room  and setting timer', (done) => {
        clientSocket.emit(socketEvent.startTransition, mockRoomId);
        setTimeout(() => {
            expect(roomManager.clearRoomTimer.called);
            done();
        }, RESPONSE_DELAY);
    });
    it('should get score and callback playerScore', (done) => {
        const callback = () => {
            return;
        };
        clientSocket.emit(socketEvent.getScore, { roomId: mockRoomId, username: 'test' }, callback);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle next question properly for a qcm', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTimerStub = sinon.spy(service, 'startTimer' as any);
        gameMock.currentQuizQuestion.type = QuestionType.QCM;
        clientSocket.emit(socketEvent.nextQuestion, mockRoomId);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.called);
            expect(startTimerStub.calledWith(mockRoomId, gameMock.duration));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle next question properly for a qrl', (done) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const startTimerStub = sinon.spy(service, 'startTimer' as any);
        gameMock.currentQuizQuestion.type = QuestionType.QLR;
        clientSocket.emit(socketEvent.nextQuestion, mockRoomId);
        setTimeout(() => {
            expect(startTimerStub.calledWith(mockRoomId, QRL_DURATION));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle update selection', (done) => {
        roomManager.getSocketIDByUsername.returns('test');
        gameMock.choicesStats = new Map();
        const mockIsSelected = true;
        const mockIndex = 1;
        clientSocket.emit(socketEvent.updateSelection, { mockRoomId, mockIsSelected, mockIndex });
        setTimeout(() => {
            expect(roomManager.getSocketIDByUsername.calledWith(mockRoomId, 'Organisateur'));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle set activity status correctly for a qrl', (done) => {
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        roomManager.getSocketIDByUsername.returns('test');
        clientSocket.emit('sendActivityStatus', { roomId: mockRoomId, isActive: true });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.calledWith(mockRoomId));
            expect(gameMock.switchActivityStatus.calledWith(true));
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should get players answers for a qrl', (done) => {
        const answer: Answers = { answers: ['1'], time: 10 };
        gameMock.playersAnswers.set('test', answer);
        const clientCallBack = (formattedList: string) => {
            expect(formattedList).to.equal('[["test",{"answers":["1"],"time":10}]]');
        };
        clientSocket.emit('getPlayerAnswers', mockRoomId, clientCallBack);
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.calledWith(mockRoomId));
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle player correction evaluation correctly for a qrl', (done) => {
        const playerCorrectionMap = new Map<string, number>([
            ['Player1', 0],
            ['Player2', 1],
        ]);
        const formattedPlayerAnswers = JSON.stringify(Array.from(playerCorrectionMap));
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        roomManager.getSocketIDByUsername.returns('test');
        clientSocket.emit('playerQrlCorrection', { roomId: mockRoomId, playerCorrection: formattedPlayerAnswers });
        setTimeout(() => {
            expect(roomManager.getGameByRoomId.calledWith(mockRoomId));
            expect(gameMock.updatePlayerScores.calledWith(playerCorrectionMap));
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should handle player interaction update for a qrl', (done) => {
        const emitSpy = sinon.spy(service['sio'].sockets, 'emit');
        roomManager.getSocketIDByUsername.returns('test');
        roomManager.getUsernameBySocketId.returns('Player1');
        clientSocket.emit('newResponseInteraction', mockRoomId);
        setTimeout(() => {
            expect(roomManager.getSocketIDByUsername.calledWith(mockRoomId, 'Organisateur'));
            expect(roomManager.getSocketIDByUsername.calledWith(mockRoomId, clientSocket.id));
            expect(emitSpy.called);
            done();
        }, RESPONSE_DELAY);
    });

    it('should toggle chat permission', (done) => {
        clientSocket.emit(socketEvent.toggleChatPermission, { roomId: mockRoomId, username: mockUsername });
        setTimeout(() => {
            expect(roomManager.getUsernameBySocketId.called);
            done();
        }, RESPONSE_DELAY);
    });
});
