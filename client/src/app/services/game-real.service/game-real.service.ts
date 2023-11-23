import { Injectable } from '@angular/core';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { GameServiceInterface } from '@app/interfaces/game-service.interface/game-service.interface';
import { InitialQuestionData, NextQuestionData } from '@common/interfaces/host.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { QuestionType } from '@common/enums/question-type.enum';

export type Player = [string, number, number];

@Injectable({
    providedIn: 'root',
})
export class GameRealService implements GameServiceInterface {
    username: string = '';
    roomId: number = 0;
    players: Player[] = [];
    answers: Map<number, string | null> = new Map();
    questionNumber: number = 1;
    timer: number = 0;
    question: QuizQuestion | null = null;
    isLast: boolean = false;
    locked: boolean = false;
    validated: boolean = false;
    qrlAnswer: string = '';

    constructor(public socketService: SocketClientService) {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSockets();
        }
    }

    init() {
        this.configureBaseSockets();
        this.socketService.send(socketEvent.getQuestion, this.roomId);
    }

    destroy() {
        this.reset();
        if (this.socketService.isSocketAlive()) this.socketService.socket.removeAllListeners();
    }

    sendAnswer() {
        if (this.question?.type === QuestionType.QCM) {
            const answers = Array.from(this.answers.values());
            this.socketService.send(socketEvent.submitAnswer, {
                roomId: this.roomId,
                answers,
                timer: this.timer,
                username: this.username,
            });
        } else {
            this.socketService.send(socketEvent.submitAnswer, {
                roomId: this.roomId,
                answers: this.qrlAnswer,
                timer: this.timer,
                username: this.username,
            });
        }
        this.locked = true;
        this.answers.clear();
        this.qrlAnswer = '';
    }

    configureBaseSockets() {
        this.socketService.on(socketEvent.getInitialQuestion, (data: InitialQuestionData) => {
            this.question = data.question;
            this.username = data.username;
            if (data.numberOfQuestions === 1) {
                this.isLast = true;
            }
        });

        this.socketService.on(socketEvent.getNextQuestion, (data: NextQuestionData) => {
            this.question = data.question;
            this.questionNumber = data.index;
            this.isLast = data.isLast;
            this.validated = false;
            this.locked = false;
        });
    }

    sendSelection(index: number, isSelected: boolean) {
        if (this.socketService.isSocketAlive()) this.socketService.send(socketEvent.updateSelection, { roomId: this.roomId, isSelected, index });
    }

    private reset() {
        this.username = '';
        this.roomId = 0;
        this.timer = 0;
        this.question = null;
        this.locked = false;
        this.validated = false;
        this.isLast = false;
        this.players = [];
        this.answers.clear();
        this.qrlAnswer = '';
        this.questionNumber = 1;
    }
}
