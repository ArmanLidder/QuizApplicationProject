import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client.service';
import {ActivatedRoute} from '@angular/router';
import { QuizQuestion } from '@common/interfaces/quiz.interface';



@Component({
  selector: 'app-game-interface',
  templateUrl: './game-interface.component.html',
  styleUrls: ['./game-interface.component.scss']
})

export class GameInterfaceComponent {
    question: QuizQuestion
    timer: number;
    playerAnswer: string[];
    playerScore: number = 0;
    isBonus: boolean;
    isTransition: boolean = false;
    isGameLocked: boolean = false;
    roomId: string | null;
    private route: ActivatedRoute;

    constructor(private readonly socketService:SocketClientService) {
        this.roomId = this.route.snapshot.paramMap.get('id');
        this.configureBaseSocketFeatures();
    }

    private sendAnswer(){
        this.socketService.send('submit answers', this.playerAnswer)
    }

    updatePlayerAnswer(answersMap: Map<number, string | null>) {
        let answers : string[] = [];
        answersMap.forEach((answer) => {
            if (answer !== null) answers.push(answer);
        })
        this.playerAnswer = answers;
    }

    private configureBaseSocketFeatures() {
        this.socketService.on('question round done', (result: {score:number, isBonus:boolean}) => {
            this.isTransition = true;
            this.playerScore = result.score;
            this.isBonus = result.isBonus;
        });

        this.socketService.on('new question', (data: {question: QuizQuestion}) => {
            this.isTransition = false;
            this.isGameLocked = false;
            this.question = data.question;
        });


        this.socketService.on('time transition', (timeValue: number) => {
            this.timer = timeValue;
            if(this.timer === 0) this.isTransition = false;
        });

        this.socketService.on('time question', (timeValue: number) => {
            this.timer = timeValue;
            if(this.timer === 0) this.sendAnswer();
        });

        this.socketService.on('end game', () => {
            //navigate to result view
        });
    }
}
