import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PLAYER_NOT_FOUND_INDEX } from '@app/components/host-interface/host-interface.component.const';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { InitialQuestionData, NextQuestionData } from '@common/interfaces/host.interface';
import { QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

type PlayerArray = [string, number, number];

@Component({
    selector: 'app-host-interface',
    templateUrl: './host-interface.component.html',
    styleUrls: ['./host-interface.component.scss'],
})
export class HostInterfaceComponent {
    @ViewChild('playerListChild') playerListComponent: PlayerListComponent;
    timerText: string = timerMessage.timeLeft;
    isGameOver: boolean = false;
    histogramDataChangingResponses = new Map<string, number>();
    histogramDataValue = new Map<string, boolean>();
    players: PlayerArray[] = [];
    leftPlayers: PlayerArray[] = [];

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private route: ActivatedRoute,
    ) {
        if (this.socketService.isSocketAlive()) this.configureBaseSocketFeatures();
        this.gameService.init(this.route.snapshot.paramMap.get('id') as string);
    }

    isDisabled() {
        return !this.gameService.gameRealService.locked && !this.gameService.gameRealService.validated;
    }

    updateHostCommand() {
        return this.gameService.gameRealService.isLast ? 'Montrer résultat' : 'Prochaine question';
    }

    handleHostCommand() {
        if (this.gameService.gameRealService.isLast) {
            this.handleLastQuestion();
        } else {
            this.nextQuestion();
        }
    }

    playerHasLeft(username: string): boolean {
        return this.leftPlayers.some((player) => player[0] === username);
    }

    private nextQuestion() {
        this.gameService.gameRealService.validated = false;
        this.gameService.gameRealService.locked = false;
        this.socketService.send(socketEvent.startTransition, this.gameService.gameRealService.roomId);
    }

    private handleLastQuestion() {
        this.socketService.send(socketEvent.showResult, this.gameService.gameRealService.roomId);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(socketEvent.timeTransition, (timeValue: number) => {
            this.timerText = timerMessage.next;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.resetInterface();
                this.socketService.send(socketEvent.nextQuestion, this.gameService.gameRealService.roomId);
                this.timerText = timerMessage.timeLeft;
            }
        });

        this.socketService.on(socketEvent.endQuestion, () => {
            this.resetInterface();
            this.playerListComponent.getPlayersList();
        });

        this.socketService.on(socketEvent.finalTimeTransition, (timeValue: number) => {
            this.timerText = timerMessage.resultAvailableIn;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) this.isGameOver = true;
        });

        this.socketService.on(socketEvent.refreshChoicesStats, (choicesStatsValue: number[]) => {
            this.histogramDataChangingResponses = this.createChoicesStatsMap(choicesStatsValue);
        });

        this.socketService.on(socketEvent.getInitialQuestion, (data: InitialQuestionData) => {
            this.playerListComponent.getPlayersList();
            this.initGraph(data.question);
        });

        this.socketService.on(socketEvent.getNextQuestion, (data: NextQuestionData) => {
            this.initGraph(data.question);
        });

        this.socketService.on(socketEvent.removedPlayer, (username) => {
            const playerIndex = this.playerListComponent.players.findIndex((player) => player[0] === username);
            if (playerIndex !== PLAYER_NOT_FOUND_INDEX) {
                this.leftPlayers.push(this.playerListComponent.players[playerIndex]);
                this.playerListComponent.getPlayersList();
            }
        });

        this.socketService.on(socketEvent.endQuestionAfterRemoval, () => {
            this.resetInterface();
        });
    }

    private resetInterface() {
        this.gameService.gameRealService.validated = true;
        this.gameService.gameRealService.locked = true;
    }

    private initGraph(question: QuizQuestion) {
        this.histogramDataValue = new Map();
        this.histogramDataChangingResponses = new Map();
        question.choices?.forEach((choice: QuizChoice) => {
            this.histogramDataValue.set(choice.text, choice.isCorrect as boolean);
        });
    }

    private createChoicesStatsMap(choicesStatsValue: number[]) {
        const choicesStats = new Map();
        const choices = this.gameService.question?.choices;
        choices?.forEach((choice: QuizChoice, index: number) => choicesStats.set(choice.text, choicesStatsValue[index]));
        return choicesStats;
    }
}