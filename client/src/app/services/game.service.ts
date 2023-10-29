import { Injectable } from '@angular/core';
import { QuizQuestion } from '@common/interfaces/quiz.interface';
import { SocketClientService } from '@app/services/socket-client.service';

type Score = Map<string, number>;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    roomId: number = 0;
    timer: number = 0;
    question: QuizQuestion;
    validated: boolean = false;
    players: Map<string, Score> = new Map();
    answers: Map<number, string | null> = new Map();

    constructor(public socketService: SocketClientService) {}
    selectChoice(index: number) {
        if (!this.validated) {
            if (this.answers.has(index)) {
                this.answers.delete(index);
            } else {
                const textChoice = this.question.choices ? this.question.choices[index].text : null;
                this.answers.set(index, textChoice);
            }
        }
    }

    sendAnswer() {
        this.socketService.send('submit answers', { roomId: this.roomId, answers: this.answers, timer: this.timer });
    }
}
