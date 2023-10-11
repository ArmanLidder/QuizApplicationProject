import { Service } from 'typedi';

type SocketId = string;
type Username = string;

interface RoomData {
    room: number;
    quizID: string;
    players: Map<Username, SocketId>;
    locked: boolean;
    bannedNames: string[];
}

@Service()
export class RoomManagingService {
    private rooms: Map<number, RoomData>;

    constructor() {
        this.rooms = new Map<number, RoomData>();
    }

    get roomMap() {
        return this.rooms;
    }

    getRoomByID(roomId: number) {
        return this.rooms.get(roomId);
    }

    addRoom(quizID: string): number {
        const roomID = this.generateUniqueRoomID();
        const roomData: RoomData = {
            room: roomID,
            quizID,
            players: new Map<Username, SocketId>(),
            locked: false,
            bannedNames: [],
        };
        this.rooms.set(roomID, roomData);
        return roomID;
    }

    deleteRoom(roomID: number): void {
        this.rooms.delete(roomID);
    }

    addUser(roomId: number, username: string, socketID: string) {
        this.rooms.get(roomId).players.set(username, socketID);
    }

    getSocketIDByUsername(roomId: number, username: string): string {
        return this.rooms.get(roomId).players.get(username);
    }

    removeUserFromRoom(roomID: number, name: string): void {
        const playerMap = this.rooms.get(roomID).players;
        playerMap.delete(name);
    }

    removeUserBySocketID(userSocketID: string): void {
        for (const [roomId, roomData] of this.rooms.entries()) {
            for (const [username, socketID] of roomData.players.entries()) {
                if (userSocketID === socketID) {
                    this.removeUserFromRoom(roomId, username);
                    return;
                }
            }
}
    }

    banUser(roomID: number, name: string): void {
        this.rooms.get(roomID).bannedNames.push(name);
        this.removeUserFromRoom(roomID, name);
    }

    // isNameValid(roomID : number, name: string): boolean{
    //     isBanned = this.rooms.get(roomID).bannedNames.includes(name);
    //     isUsed = this.rooms.get(roomID).players.has(name);
    //     return {isBanned: isBanned};
    // }

    isNameUsed(roomID: number, name: string): boolean {
        return this.rooms.get(roomID).players.has(name);
    }

    isNameBanned(roomID: number, name: string): boolean {
        return this.rooms.get(roomID).bannedNames.includes(name);
    }

    changeLockState(roomID: number): void {
        const room = this.rooms.get(roomID);
        room.locked = !room.locked;
    }

    private isRoomExistent(code: number): boolean {
        return this.rooms.has(code);
    }

    private generateUniqueRoomID(): number {
        let roomID: number;
        const UPPER_BOUND_MULTIPLIER = 9000;
        const LOWER_BOUND = 1000;
        do {
            roomID = Math.floor(Math.random() * UPPER_BOUND_MULTIPLIER) + LOWER_BOUND;
        } while (this.isRoomExistent(roomID));
        return roomID;
    }
}
