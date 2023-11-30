import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PLAYER_NOT_FOUND_INDEX, TransportStatsFormat } from '@app/components/host-interface/host-interface.component.const';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { Player } from '@app/components/player-list/player-list.component.const';
import { QuestionStatistics } from '@app/components/statistic-zone/statistic-zone.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';
import { QuestionType } from '@common/enums/question-type.enum';
import { InitialQuestionData, NextQuestionData } from '@common/interfaces/host.interface';
import { QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';
import { socketEvent } from '@common/socket-event-name/socket-event-name';

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
    reponsesQRL = new Map<string, { answers: string; time: number }>();
    isHostEvaluating: boolean = false;
    gameStats: QuestionStatistics[] = [];
    isPaused: boolean = false;
    isPanicMode: boolean = false;

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
        this.isPaused = !this.isPaused;
        this.socketService.send(socketEvent.PAUSE_TIMER, this.gameService.gameRealService.roomId);
    }

    panicMode() {
        this.socketService.send(socketEvent.PANIC_MODE, {
            roomId: this.gameService.gameRealService.roomId,
            timer: this.gameService.gameRealService.timer,
        });
        this.isPanicMode = true;
    }
    private saveStats() {
        const question = this.gameService.gameRealService.question;
        if (question !== null) {
            const savedStats: QuestionStatistics = [this.histogramDataValue, this.histogramDataChangingResponses, question];
            if (question.type !== QuestionType.QLR) this.gameStats.push(savedStats);
        }
    }

    private nextQuestion() {
        this.isPanicMode = false;
        this.gameService.gameRealService.validated = false;
        this.gameService.gameRealService.locked = false;
        this.socketService.send(socketEvent.START_TRANSITION, this.gameService.gameRealService.roomId);
    }

    private handleLastQuestion() {
        this.sendGameStats();
        this.socketService.send(socketEvent.SHOW_RESULT, this.gameService.gameRealService.roomId);
    }

    private configureBaseSocketFeatures() {
        this.socketService.on(socketEvent.TIME_TRANSITION, (timeValue: number) => {
            this.timerText = timerMessage.next;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.gameService.gameRealService.inTimeTransition = false;
                this.resetInterface();
                this.socketService.send(socketEvent.NEXT_QUESTION, this.gameService.gameRealService.roomId);
                this.timerText = timerMessage.timeLeft;
            }
        });

        this.socketService.on(socketEvent.END_QUESTION, () => {
            this.gameService.audio.pause();
            this.gameService.audio.currentTime = 0;
            this.gameService.gameRealService.audioPaused = false;
            this.gameService.gameRealService.inTimeTransition = true;
            this.resetInterface();
            if (this.gameService.question?.type === QuestionType.QCM) {
                this.playerListComponent.getPlayersList(false);
            } else {
                this.sendQrlAnswer();
            }
        });

        this.socketService.on(socketEvent.FINAL_TIME_TRANSITION, (timeValue: number) => {
            this.timerText = timerMessage.resultAvailableIn;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0) {
                this.isGameOver = true;
                this.playerListComponent.getPlayersList();
            }
        });

        this.socketService.on(socketEvent.REFRESH_CHOICES_STATS, (choicesStatsValue: number[]) => {
            this.histogramDataChangingResponses = this.createChoicesStatsMap(choicesStatsValue);
        });

        this.socketService.on(socketEvent.GET_INITIAL_QUESTION, async (data: InitialQuestionData) => {
            const numberOfPlayers = await this.playerListComponent.getPlayersList();
            this.initGraph(data.question, numberOfPlayers);
        });

        this.socketService.on(socketEvent.GET_NEXT_QUESTION, async (data: NextQuestionData) => {
            const numberOfPlayers = await this.playerListComponent.getPlayersList();
            this.initGraph(data.question, numberOfPlayers);
        });

        this.socketService.on(socketEvent.REMOVED_PLAYER, (username) => {
            const playerIndex = this.playerListComponent.players.findIndex((player) => player[0] === username);
            if (playerIndex !== PLAYER_NOT_FOUND_INDEX) {
                this.leftPlayers.push(this.playerListComponent.players[playerIndex]);
                this.playerListComponent.getPlayersList(false).then();
            }
        });

        this.socketService.on(socketEvent.END_QUESTION_AFTER_REMOVAL, () => {
            this.resetInterface();
        });

        this.socketService.on(socketEvent.EVALUATION_OVER, () => {
            this.playerListComponent.getPlayersList(false).then();
        });

        this.socketService.on(socketEvent.REFRESH_ACTIVITY_STATS, (activityStatsValue: [number, number]) => {
            this.histogramDataChangingResponses = new Map([
                ['Actif', activityStatsValue[0]],
                ['Inactif', activityStatsValue[1]],
            ]);
        });
    }

    private resetInterface() {
        this.gameService.gameRealService.validated = true;
        this.gameService.gameRealService.locked = true;
    }

    private initGraph(question: QuizQuestion, numberOfPlayers?: number) {
        this.histogramDataValue = new Map();
        this.histogramDataChangingResponses = new Map();
        if (this.gameService.question?.type === QuestionType.QCM) {
            question.choices?.forEach((choice: QuizChoice) => {
                this.histogramDataValue.set(choice.text, choice.isCorrect as boolean);
            });
        } else {
            this.histogramDataChangingResponses = new Map([
                ['Actif', 0],
                ['Inactif', numberOfPlayers as number],
            ]);
            this.histogramDataValue = new Map([
                ['Actif', true],
                ['Inactif', false],
            ]);
        }
    }

    private createChoicesStatsMap(choicesStatsValue: number[]) {
        const choicesStats = new Map();
        const choices = this.gameService.question?.choices;
        choices?.forEach((choice: QuizChoice, index: number) => choicesStats.set(choice.text, choicesStatsValue[index]));
        return choicesStats;
    }

    private sendQrlAnswer() {
        this.socketService.send(socketEvent.GET_PLAYER_ANSWERS, this.gameService.gameRealService.roomId, (playerAnswers: string) => {
            this.reponsesQRL = new Map(JSON.parse(playerAnswers));
            this.isHostEvaluating = true;
        });
    }

    private sendGameStats() {
        const gameStats = this.stringifyStats();
        this.socketService.send(socketEvent.GAME_STATUS_DISTRIBUTION, { roomId: this.gameService.gameRealService.roomId, stats: gameStats });
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
