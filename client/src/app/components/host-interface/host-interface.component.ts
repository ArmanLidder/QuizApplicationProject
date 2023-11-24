import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PLAYER_NOT_FOUND_INDEX, TransportStatsFormat } from '@app/components/host-interface/host-interface.component.const';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { InitialQuestionData, NextQuestionData } from '@common/interfaces/host.interface';
import { QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { Player } from '@app/components/player-list/player-list.component.const';
import { QuestionStatistics } from '@app/components/statistic-zone/statistic-zone.component.const';
import { QuestionType } from '@common/enums/question-type.enum';

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
    leftPlayers: Player[] = [];
    gameStats: QuestionStatistics[] = [];

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
        this.saveStats();
        if (this.gameService.gameRealService.isLast) {
            this.handleLastQuestion();
        } else {
            this.nextQuestion();
        }
    }

    playerHasLeft(username: string): boolean {
        return this.leftPlayers.some((player) => player[0] === username);
    }

    pauseTimer() {
        this.socketService.send(socketEvent.pauseTimer, this.gameService.gameRealService.roomId);
    }

    panicMode() {
        this.socketService.send(socketEvent.panicMode, {
            roomId: this.gameService.gameRealService.roomId,
            timer: this.gameService.gameRealService.timer,
        });
    private saveStats() {
        const question = this.gameService.gameRealService.question;
        if (question !== null) {
            const dataValue = question.type === QuestionType.QLR ? this.generateQRLMap() : this.histogramDataValue;
            const savedStats: QuestionStatistics = [dataValue, this.histogramDataChangingResponses, question];
            this.gameStats.push(savedStats);
        }
    }

    private generateQRLMap() {
        return new Map([
            ['0', false],
            ['50', false],
            ['100', true],
        ]);
    }

    private nextQuestion() {
        this.gameService.gameRealService.validated = false;
        this.gameService.gameRealService.locked = false;
        this.socketService.send(socketEvent.startTransition, this.gameService.gameRealService.roomId);
    }

    private handleLastQuestion() {
        this.sendGameStats();
        this.socketService.send(socketEvent.showResult, this.gameService.gameRealService.roomId);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(socketEvent.timeTransition, (timeValue: number) => {
            this.timerText = timerMessage.next;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.gameRealService.inTimeTransition = false;
                this.resetInterface();
                this.socketService.send(socketEvent.nextQuestion, this.gameService.gameRealService.roomId);
                this.timerText = timerMessage.timeLeft;
            }
        });

        this.socketService.on(socketEvent.endQuestion, () => {
            this.gameService.audio.pause();
            this.gameService.audio.currentTime = 0;
            this.gameService.gameRealService.audioPaused = false;
            this.gameService.gameRealService.inTimeTransition = true;
            this.resetInterface();
            this.playerListComponent.getPlayersList(false);
        });

        this.socketService.on(socketEvent.finalTimeTransition, (timeValue: number) => {
            this.timerText = timerMessage.resultAvailableIn;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.isGameOver = true;
                this.playerListComponent.getPlayersList();
            }
        });

        this.socketService.on(socketEvent.refreshChoicesStats, (choicesStatsValue: number[]) => {
            this.histogramDataChangingResponses = this.createChoicesStatsMap(choicesStatsValue);
        });

        this.socketService.on(socketEvent.getInitialQuestion, (data: InitialQuestionData) => {
            this.playerListComponent.getPlayersList();
            this.initGraph(data.question);
        });

        this.socketService.on(socketEvent.getNextQuestion, (data: NextQuestionData) => {
            this.playerListComponent.getPlayersList();
            this.initGraph(data.question);
        });

        this.socketService.on(socketEvent.removedPlayer, (username) => {
            const playerIndex = this.playerListComponent.players.findIndex((player) => player[0] === username);
            if (playerIndex !== PLAYER_NOT_FOUND_INDEX) {
                this.leftPlayers.push(this.playerListComponent.players[playerIndex]);
                this.playerListComponent.getPlayersList(false);
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

    private sendGameStats() {
        const gameStats = this.stringifyStats();
        this.socketService.send(socketEvent.gameStatsDistribution, { roomId: this.gameService.gameRealService.roomId, stats: gameStats });
    }

    private stringifyStats() {
        const stats = this.prepareStatsTransport();
        return JSON.stringify(stats);
    }

    private prepareStatsTransport() {
        const data: TransportStatsFormat = [];
        this.gameStats.forEach((stats) => {
            const values = this.mapValueToArray(stats[0]);
            const responses = this.mapResponseToArray(stats[1]);
            data.push([values, responses, stats[2]]);
        });
        return data;
    }

    private mapResponseToArray(map: Map<string, number>) {
        return Array.from(map);
    }

    private mapValueToArray(map: Map<string, boolean>) {
        return Array.from(map);
    }
}
