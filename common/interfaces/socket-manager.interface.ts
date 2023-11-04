import { Message } from './message.interface';

export interface roomIdAndUsername {
    roomId: number;
    username: string;
}

export interface roomIdAndMessage {
    roomId: number;
    message: Message;
}

export interface roomIdAndTime {
    roomId: number;
    time: number;
}
export interface roomIdAndAnswers {
    roomId: number;
    answers: string[];
    timer: number;
    username: string;
}

export interface roomIdAndSelection {
    roomId: number;
    isSelected: boolean;
    index: number;
}
