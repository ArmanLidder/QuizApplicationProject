import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PLAYER_NOT_FOUND_INDEX } from '@app/components/host-interface/host-interface.component.const';
import { PlayerListComponent } from '@app/components/player-list/player-list.component';
import { Player } from '@app/components/player-list/player-list.component.const';
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
            if (this.gameService.question?.type === QuestionType.QCM) {
                this.playerListComponent.getPlayersList(false);
            } else {
                this.socketService.send(socketEvent.getPlayerAnswers, this.gameService.gameRealService.roomId, (playerAnswers: string = '') => {
                    this.reponsesQRL = new Map(JSON.parse(playerAnswers));
                    this.isHostEvaluating = true;
                });
            }
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

        this.socketService.on(socketEvent.getInitialQuestion, async (data: InitialQuestionData) => {
            const numberOfPlayers = await this.playerListComponent.getPlayersList();
            this.initGraph(data.question, numberOfPlayers);
        });

        this.socketService.on(socketEvent.getNextQuestion, async (data: NextQuestionData) => {
            const numberOfPlayers = await this.playerListComponent.getPlayersList();
            this.initGraph(data.question, numberOfPlayers);
        });

        this.socketService.on(socketEvent.removedPlayer, (username) => {
            const playerIndex = this.playerListComponent.players.findIndex((player) => player[0] === username);
            if (playerIndex !== PLAYER_NOT_FOUND_INDEX) {
                this.leftPlayers.push(this.playerListComponent.players[playerIndex]);
                this.playerListComponent.getPlayersList(false).then();
            }
        });

        this.socketService.on(socketEvent.endQuestionAfterRemoval, () => {
            this.resetInterface();
        });

        this.socketService.on(socketEvent.evaluationOver, () => {
            this.playerListComponent.getPlayersList(false).then();
        });

        this.socketService.on(socketEvent.refreshActivityStats, (activityStatsValue: [number, number]) => {
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
}
