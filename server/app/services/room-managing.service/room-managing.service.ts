import { Game } from '@app/classes/game/game';
import { Message } from '@common/interfaces/message.interface';
import { Service } from 'typedi';
import { HOST_USERNAME } from '@common/names/host-username';

type SocketId = string;
type Username = string;

export interface RoomData {
    room: number;
    quizID: string;
    players: Map<Username, SocketId>;
    locked: boolean;
    game: Game;
    timer: NodeJS.Timer;
    bannedNames: string[];
    messages?: Message[];
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

    clearRoomTimer(roomId: number) {
        const room = this.getRoomById(roomId);
        if (room) clearInterval(room.timer);
    }

    getRoomById(roomId: number) {
        return this.rooms.get(roomId);
    }

    getGameByRoomId(roomId: number) {
        return this.rooms.get(roomId)?.game;
    }

    addRoom(quizID: string): number {
        const roomID = this.generateUniqueRoomID();
        const roomData: RoomData = {
            room: roomID,
            quizID,
            players: new Map<Username, SocketId>(),
            locked: false,
            game: null,
            bannedNames: [],
            messages: [],
            timer: null,
        };
        this.rooms.set(roomID, roomData);
        return roomID;
    }

    deleteRoom(roomID: number): void {
        this.clearRoomTimer(roomID);
        this.rooms.delete(roomID);
    }

    addUser(roomId: number, username: string, socketID: string) {
        this.getRoomById(roomId).players.set(username, socketID);
    }

    addMessage(roomId: number, message: Message) {
        this.getRoomById(roomId).messages?.push(message);
    }

    getSocketIDByUsername(roomId: number, username: string): string {
        return this.getRoomById(roomId).players.get(username);
    }

    getUsernameBySocketId(roomId: number, userSocketId: string): string {
        const playersMap = this.getRoomById(roomId).players;
        for (const [username] of playersMap.entries()) {
            if (playersMap.get(username) === userSocketId) return username;
        }
        return undefined;
    }

    removeUserFromRoom(roomID: number, name: string): void {
        const playerMap = this.getRoomById(roomID).players;
        playerMap.delete(name);
    }

    removeUserBySocketID(userSocketID: string) {
        for (const [roomId, roomData] of this.rooms.entries()) {
            for (const [username, socketID] of roomData.players.entries()) {
                if (userSocketID === socketID) {
                    this.removeUserFromRoom(roomId, username);
                    return { roomId, username };
                }
            }
        }
        return undefined;
    }

    getUsernamesArray(roomId: number) {
        if (roomId !== undefined) {
            const players = Array.from(this.getRoomById(roomId).players.keys());
            players.splice(players.indexOf(HOST_USERNAME), 1);
            return players;
        } else return undefined;
    }

    banUser(roomID: number, name: string): void {
        this.rooms.get(roomID).bannedNames.push(name);
        this.removeUserFromRoom(roomID, name);
    }

    isNameUsed(roomID: number, name: string): boolean {
        const room = this.getRoomById(roomID);
        return Array.from(room.players.keys()).some((username) => username.toLowerCase() === name.toLowerCase());
    }

    isNameBanned(roomID: number, name: string): boolean {
        const room = this.getRoomById(roomID);
        return Array.from(room.bannedNames).some((username) => username.toLowerCase() === name.toLowerCase());
    }

    isRoomLocked(roomID: number): boolean {
        return this.getRoomById(roomID).locked;
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
