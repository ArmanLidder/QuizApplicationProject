import { describe } from 'mocha';
import { expect } from 'chai';
import { RoomData, RoomManagingService } from '@app/services/room-managing.service';
import * as sinon from 'sinon';
import { Message } from '@common/interfaces/message.interface';
describe('Room Managing Service', () => {
    let roomService: RoomManagingService;
    const roomId = 1;
    const mockUsername = 'usernameOne';
    const mockSocket = 'socketOne';
    const mockBannedNames = ['Jean'];
    const mockMessages: Message[] = [{ sender: 'user 1', content: 'message 1', time: 'time 1' }];
    beforeEach(() => {
        roomService = new RoomManagingService();
        roomService['rooms'].set(roomId, {
            room: roomId,
            quizID: 'quiz123',
            players: new Map([
                ['Organisateur', 'socket organisateur'],
                [mockUsername, mockSocket],
            ]),
            locked: false,
            bannedNames: mockBannedNames.slice(), // Deep copy of mockBannedNames
            messages: mockMessages,
        });
    });

    it('should add a room and retrieve it by ID', () => {
        const roomID = roomService.addRoom('quiz123');
        const roomData = roomService.roomMap.get(roomID);

        expect(roomData).to.not.equal(undefined);
        expect(roomData.room).to.equal(roomID);
        expect(roomData.quizID).to.equal('quiz123');
    });

    it('should delete a room', () => {
        roomService.deleteRoom(roomId);
        expect(roomService.getRoomByID(roomId)).to.equal(undefined);
    });

    it('should add a user to a room', () => {
        const mockSocketId = 'socketID';
        const roomData = roomService['rooms'].get(roomId);

        roomService.addUser(roomId, mockUsername, mockSocketId);
        expect(roomData.players.get(mockUsername)).to.equal(mockSocketId);
    });

    it('get socketID by username', () => {
        const username = 'usernameOne';
        const socket = roomService.getSocketIDByUsername(roomId, username);

        expect(socket).to.equal(mockSocket);
    });

    it('should remove a user from a room', () => {
        const roomData = roomService['rooms'].get(roomId);
        roomService.removeUserFromRoom(roomId, mockUsername);
        expect(roomData.players.has(mockUsername)).to.equal(false);
    });

    it('should ban a user from a room', () => {
        const roomData = roomService['rooms'].get(roomId);
        roomService.banUser(roomId, mockUsername);
        expect(roomData.bannedNames).to.include(mockUsername);
        expect(roomService.roomMap.get(roomId).players.get(mockUsername)).to.equal(undefined);
    });

    it('should check if a name is used in a room', () => {
        const nonExistingName = 'usernameNonExistent';
        expect(roomService.isNameUsed(roomId, mockUsername)).to.equal(true);
        expect(roomService.isNameUsed(roomId, nonExistingName)).to.equal(false);
    });

    it('should check if a name is banned in a room', () => {
        expect(roomService.isNameBanned(roomId, mockBannedNames[0])).to.equal(true);
        expect(roomService.isNameBanned(roomId, mockUsername)).to.equal(false);
    });

    it('should return players name list', () => {
        expect(roomService.getUsernamesArray(roomId)).to.deep.equals(['usernameOne']);
        expect(roomService.getUsernamesArray(undefined)).to.equal(undefined);
    });

    it('should check if room is locked', () => {
        expect(roomService.isRoomLocked(roomId)).to.equal(false);
    });

    it('should change the lock state of a room', () => {
        const initialLockState = roomService.roomMap.get(roomId).locked;
        roomService.changeLockState(roomId);
        const updatedLockState = roomService.roomMap.get(roomId).locked;
        expect(updatedLockState).to.not.equal(initialLockState);
    });

    it('should remove user by SocketID', () => {
        const roomData = roomService.roomMap.get(roomId);
        const socketToRemove = 'socketToRemove';
        roomService.addUser(roomId, 'userToRemove', socketToRemove);
        let result = roomService.removeUserBySocketID(socketToRemove);
        expect(roomData.players.get('userToRemove')).to.equal(undefined);
        expect(result).to.deep.equal({ roomId, username: 'userToRemove' });

        result = roomService.removeUserBySocketID('non existant socket');
        expect(result).to.equal(undefined);
    });

    it('should check if room is existent', () => {
        const nonExistentRoomId = 6;
        expect(roomService['isRoomExistent'](roomId)).to.to.equal(true);
        expect(roomService['isRoomExistent'](nonExistentRoomId)).to.equal(false);
    });

    it('should generate a uniqueRoomID between 1000 and 9999', () => {
        const maxLoop = 10000;
        const lowerBound = 1000;
        const upperBound = 9999;
        for (let i = 0; i < maxLoop; i++) {
            expect(roomService['generateUniqueRoomID']()).to.not.equal(roomId);
            expect(roomService['generateUniqueRoomID']()).gte(lowerBound);
            expect(roomService['generateUniqueRoomID']()).lte(upperBound);
        }
    });

    it('should add a new message to the messages of the room', () => {
        const newMessage: Message = { sender: 'user 2', content: 'message 2', time: 'time 2' };
        roomService.addMessage(roomId, newMessage);
        expect(roomService.roomMap.get(roomId).messages.length).to.equal(2);
        expect(roomService.roomMap.get(roomId).messages[1]).to.deep.equal(newMessage);
    });

    it('should add a new message to an empty array of messages', () => {
        const newMessage: Message = { sender: 'user 2', content: 'message 2', time: 'time 2' };
        roomService.roomMap.get(roomId).messages = undefined;
        roomService.addMessage(roomId, newMessage);
        expect(roomService.roomMap.get(roomId).messages).to.equal(undefined);
    });

    it('should return the username for a valid socket ID', () => {
        const mockRoom: RoomData = {
            room: 1,
            quizID: '',
            players: new Map<string, string>(),
            locked: false,
            bannedNames: [],
        };
        mockRoom.players.set(mockUsername, mockSocket);

        sinon.stub(roomService, 'getRoomByID').returns(mockRoom);
        const result = roomService.getUsernameBySocketId(roomId, mockSocket);
        expect(result).to.equal(mockUsername);
    });

    it('should return undefined for an invalid socket ID', () => {
        const nonExistantSocketId = 'none';
        const mockRoom: RoomData = {
            room: 1,
            quizID: '',
            players: new Map<string, string>(),
            locked: false,
            bannedNames: [],
        };
        mockRoom.players.set(mockUsername, mockSocket);

        sinon.stub(roomService, 'getRoomByID').returns(mockRoom);
        const result = roomService.getUsernameBySocketId(roomId, nonExistantSocketId);
        expect(result).to.equal(undefined);
    });
});
