import { Server } from 'app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service';
import { SinonStubbedInstance } from 'sinon';
import { RoomData, RoomManagingService } from '@app/services/room-managing.service';

const RESPONSE_DELAY = 200;

describe('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';
    let roomManager: SinonStubbedInstance<RoomManagingService>;

    const mockRoomId = 1000;
    const mockUsername = 'mockUsername';
    let mockRoom: RoomData;

    beforeEach(async () => {
        mockRoom = {
            room: mockRoomId, // Replace with the desired room number
            quizID: 'quiz123',
            players: new Map([
                ['username1', 'socketId1'],
                ['username2', 'socketId2'],
            ]),
            locked: false,
            bannedNames: ['John', 'Alice'],
        };
        server = Container.get(Server);
        await server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
        roomManager = sinon.createStubInstance(RoomManagingService);
        roomManager['rooms'] = new Map([[mockRoomId, mockRoom]]);
        roomManager.addRoom.returns(mockRoomId);
        roomManager.getRoomByID.returns(mockRoom);
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

    it('should broadcast to all sockets when emiting time', () => {
        const spy = sinon.spy(service['sio'].sockets, 'emit');
        service['emitTime']();
        assert(spy.called);
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
        const expectedPlayers = Array.from(roomManager.getRoomByID(mockRoomId).players.keys());
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
        clientSocket.emit('gather players username', mockRoomId, clientCallback); // c'est bon sa marche pozer
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
});
