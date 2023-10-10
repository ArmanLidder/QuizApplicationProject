import { Service } from 'typedi';

interface RoomData {
    room : number,
    quiz_id: string;
    players: string[]
    locked: boolean;
    bannedNames: string[]
}

@Service()
export class RoomManagingService {
    private rooms : Map<number,RoomData>;

    constructor() {
        this.rooms = new Map<number, RoomData>();
    }

    public addRoom() {
        const roomID = this.generateUniqueRoomID();
        const roomData: RoomData = {
            room: roomID,
            quiz_id: '',
            players: [],
            locked: false,
            bannedNames: []
        };
        this.rooms.set(roomID, roomData);
        return roomID;
    }

    private isRoomExistant(code : number): boolean {
        return this.rooms.has(code);
    }
    private generateUniqueRoomID(): number {
        let roomID : number;
        const UPPER_BOUND_MULTIPLIER: number = 9000;
        const LOWER_BOUND: number = 1000;
        do {
           roomID = Math.floor(Math.random() * UPPER_BOUND_MULTIPLIER) + LOWER_BOUND;
        } while (this.isRoomExistant(roomID))
        return roomID;
    }
}


