import { describe } from 'mocha';
import { expect } from 'chai';
import { RoomManagingService } from '@app/services/room-managing.service';

describe.only('Room Managing Service', () => {
    let roomService: RoomManagingService;
    const roomId = 1
    const mockUsername = 'usernameOne';
    const mockSocket = 'socketOne'
    const mockBannedNames = ['Jean']
    beforeEach(() => {
        roomService = new RoomManagingService();
        roomService['rooms'].set(roomId, {
            room: roomId,
            quizID: 'quiz123',
            players: new Map([[mockUsername, mockSocket]]),
            locked: false,
            bannedNames: mockBannedNames.slice(), //Deep copy of mockBannedNames
        })
    });

    it('should add a room and retrieve it by ID', () => {
        const roomID = roomService.addRoom('quiz123');
        const roomData = roomService.roomMap.get(roomID);

        expect(roomData).to.exist;
        expect(roomData!.room).to.equal(roomID);
        expect(roomData!.quizID).to.equal('quiz123');
    });

    it('should delete a room', () => {
        roomService.deleteRoom(roomId);
        expect(roomService.getRoomByID(roomId)).to.be.undefined;
    });

    it('should add a user to a room', () => {
        const mockUsername = 'username';
        const mockSocketId = 'socketID'
        const roomData = roomService['rooms'].get(roomId);

        roomService.addUser(roomId,mockUsername,mockSocketId)
        expect(roomData.players.get(mockUsername)).to.equal(mockSocketId);
    });

    it('get socketID by username', () => {
        const username = 'usernameOne';
        const socket = roomService.getSocketIDByUsername(roomId,username);

        expect(socket).to.equal(mockSocket);
    });

    it('should remove a user from a room', () => {
        const roomData = roomService['rooms'].get(roomId);
        roomService.removeUserFromRoom(roomId, mockUsername);
        expect(roomData.players.has(mockUsername)).to.be.false;
    });

    it('should ban a user from a room', () => {
        const roomData = roomService['rooms'].get(roomId);
        roomService.banUser(roomId, mockUsername);
        expect(roomData.bannedNames).to.include(mockUsername);
        expect(roomService.roomMap.get(roomId).players.get(mockUsername)).to.be.undefined;
    });

    it('should check if a name is used in a room', () => {
        const nonExistingName = 'usernameNonExistent';
        expect(roomService.isNameUsed(roomId, mockUsername)).to.be.true;
        expect(roomService.isNameUsed(roomId, nonExistingName)).to.be.false;
    });

    it('should check if a name is banned in a room', () => {
        expect(roomService.isNameBanned(roomId, mockBannedNames[0])).to.be.true;
        expect(roomService.isNameBanned(roomId, mockUsername)).to.be.false;
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
        expect(roomData.players.get('userToRemove')).to.be.undefined;
        expect(result).to.deep.equal({ roomId, username: 'userToRemove' });

        result = roomService.removeUserBySocketID('non existant socket');
        expect(result).to.be.undefined
    });

    it('should check if room is existent', () => {
        const nonExistentRoomId = 6
        expect(roomService['isRoomExistent'](roomId)).to.be.true;
        expect(roomService['isRoomExistent'](nonExistentRoomId)).to.be.false;
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
});
