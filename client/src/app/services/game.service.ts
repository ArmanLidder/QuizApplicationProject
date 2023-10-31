import { Injectable } from '@angular/core';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { SocketClientService } from '@app/services/socket-client.service';

type Score = Map<string, number>;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    isInputFocused: boolean = false;
    username: string;
    roomId: number = 0;
    timer: number = 0;
    question: QuizQuestion | null;
    isLast: boolean = false;
    locked: boolean = false;
    validated: boolean = false;
    players: Map<string, Score> = new Map();
    answers: Map<number, string | null> = new Map();
    questionNumber: number = 1;

    constructor(public socketService: SocketClientService) {
        if (this.socketService.isSocketAlive()) this.configureBaseSockets();
    }

    destroy() {
        this.reset();
        this.socketService.socket.offAny();
    }

    init() {
        if (this.socketService.isSocketAlive()) {
            this.configureBaseSockets();
            this.socketService.send('get question', this.roomId);
        }
    }

    selectChoice(index: number) {
        if (!this.locked) {
            if (this.answers.has(index)) {
                this.answers.delete(index);
            } else {
                const textChoice = this.question?.choices ? this.question.choices[index].text : null;
                this.answers.set(index, textChoice);
            }
        }
    }

    sendAnswer() {
        const answers = Array.from(this.answers.values());
        this.socketService.send('submit answer', {
            roomId: this.roomId,
            answers,
            timer: this.timer,
            username: this.username,
        });
        this.locked = true;
        this.answers.clear();
    }

    configureBaseSockets() {
        this.socketService.on('get initial question', (data: { question: QuizQuestion; username: string; index: number }) => {
            this.question = data.question;
            this.username = data.username;
        });

        this.socketService.on('get next question', (data: { question: QuizQuestion; index: number; isLast: boolean }) => {
            this.question = data.question;
            this.questionNumber = data.index;
            this.isLast = data.isLast;
            this.validated = false;
            this.locked = false;
        });

        this.socketService.on('time', (timeValue: number) => {
            this.handleTimeEvent(timeValue);
        });
    }

    private handleTimeEvent(timeValue: number) {
        this.timer = timeValue;
        if (this.timer === 0 && !this.locked) {
            this.locked = true;
            if (this.username !== 'Organisateur') this.sendAnswer();
        }
    }

    private reset() {
        this.username = '';
        this.roomId = 0;
        this.timer = 0;
        this.question = null;
        this.locked = false;
        this.validated = false;
        this.isLast = false;
        this.players.clear();
        this.answers.clear();
        this.questionNumber = 1;
    }
}
