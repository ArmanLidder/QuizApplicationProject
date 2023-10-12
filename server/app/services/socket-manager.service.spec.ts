import { Server } from 'app/server';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from '@app/services/socket-manager.service';
import { SinonStubbedInstance } from 'sinon';
import { RoomData, RoomManagingService } from '@app/services/room-managing.service';

const RESPONSE_DELAY = 200;

describe.only('SocketManager service tests', () => {
    let service: SocketManager;
    let server: Server;
    let clientSocket: Socket;
    const urlString = 'http://localhost:3000';
    let roomManager: SinonStubbedInstance<RoomManagingService>;

    const mockRoomId = 1000;
    const mockUsername = 'mockUsername';
    const mockRoom: RoomData = {
        room: mockRoomId, // Replace with the desired room number
        quizID: 'quiz123',
        players: new Map([
            ['username1', 'socketId1'],
            ['username2', 'socketId2'],
        ]),
        locked: false, // Set the locked status as needed
        bannedNames: ['John', 'Alice'], // List of banned names
    };

    beforeEach(async () => {
        server = Container.get(Server);
        await server.init();
        service = server['socketManager'];
        clientSocket = ioClient(urlString);
        roomManager = sinon.createStubInstance(RoomManagingService);
        roomManager.addRoom.returns(mockRoomId);
        roomManager.getRoomByID.returns(mockRoom);
        // Use the stubbed roomManager in the service
        service['roomManager'] = roomManager;
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
            expect(roomManager.addUser.calledOnceWith(mockRoomId, mockUsername, clientSocket.id));
        };

        clientSocket.emit('player join', { roomId: mockRoomId, username: mockUsername }, clientCallBack);
        clientSocket.on('new player', (players: string[]) => {
            expect(players).to.deep.equal(expectedPlayers);
            done();
        });
        setTimeout(() => {
            const newRoomSize = service['sio'].sockets.adapter.rooms.get(String(mockRoomId))?.size;
            expect(newRoomSize).to.equal(1);
        }, RESPONSE_DELAY);
    });

    // it('should handle a player ban', () => {
    //     // const bannedSocket = ioClient(urlString);
    //     // const spy = sinon.spy(service['sio'].sockets, 'to');
    //     // roomManager.getSocketIDByUsername.returns(bannedSocket.id);
    //     // clientSocket.emit('ban player',{ roomId: mockRoomId, username: mockUsername } );
    //     // bannedSocket.on('removed from game', (message: string) => {
    //     //     assert(spy.called);
    //     //     done();
    //     // });
    // });
});
