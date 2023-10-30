import { Injectable } from '@angular/core';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { SocketClientService } from '@app/services/socket-client.service';

type Score = Map<string, number>;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    username: string;
    roomId: number = 0;
    timer: number = 0;
    question: QuizQuestion | null;
    locked: boolean = false;
    validated: boolean = false;
    players: Map<string, Score> = new Map();
    answers: Map<number, string | null> = new Map();
    currentQuestionIndex: number = 0;

    constructor(public socketService: SocketClientService) {
        this.configureBaseSockets();
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
        this.answers.clear();
    }

    configureBaseSockets() {
        this.socketService.on('get initial question', (data: { question: QuizQuestion; username: string }) => {
            this.question = data.question;
            this.username = data.username;
        });

        this.socketService.on('get next question', (question: QuizQuestion) => {
            this.question = question;
        });

        this.socketService.on('time', (timeValue: number) => {
            this.timer = timeValue;
            if (this.timer === 0 && !this.locked) {
                this.locked = true;
                this.sendAnswer();
            }
        });
    }
}
