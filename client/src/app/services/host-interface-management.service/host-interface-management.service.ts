import { Injectable } from '@angular/core';
import { timerMessage } from '@common/browser-message/displayable-message/timer-message';
import { Player } from '@app/components/player-list/player-list.component.const';
import { QuestionStatistics } from '@app/components/statistic-zone/statistic-zone.component.const';
import { GameService } from '@app/services/game.service/game.service';
import { SocketClientService } from '@app/services/socket-client.service/socket-client.service';
import { InteractiveListSocketService } from '@app/services/interactive-list-socket.service/interactive-list-socket.service';
import { socketEvent } from '@common/socket-event-name/socket-event-name';
import { QuestionType } from '@common/enums/question-type.enum';
import { HOST_USERNAME } from '@common/names/host-username';
import { InitialQuestionData, NextQuestionData } from '@common/interfaces/host.interface';
import {
    ACTIVE,
    ACTIVE_STATUS,
    INACTIVE,
    INACTIVE_STATUS,
    PLAYER_NOT_FOUND_INDEX,
    RESPONSE,
    TransportStatsFormat,
    VALUE,
} from '@app/components/host-interface/host-interface.component.const';
import { QuizChoice, QuizQuestion } from '@common/interfaces/quiz.interface';

@Injectable({
    providedIn: 'root',
})
export class HostInterfaceManagementService {
    timerText: string = timerMessage.timeLeft;
    isGameOver: boolean = false;
    histogramDataChangingResponses = new Map<string, number>();
    histogramDataValue = new Map<string, boolean>();
    leftPlayers: Player[] = [];
    responsesQRL = new Map<string, { answers: string; time: number }>();
    isHostEvaluating: boolean = false;
    gameStats: QuestionStatistics[] = [];
    isPaused: boolean = false;
    isPanicMode: boolean = false;

    constructor(
        public gameService: GameService,
        private readonly socketService: SocketClientService,
        private interactiveListService: InteractiveListSocketService,
    ) {}

    private get roomId() {
        return this.gameService.gameRealService.roomId;
    }

    sendPauseTimer() {
        this.isPaused = !this.isPaused;
        this.socketService.send(socketEvent.PAUSE_TIMER, this.gameService.gameRealService.roomId);
    }

    startPanicMode() {
        this.socketService.send(socketEvent.PANIC_MODE, {
            roomId: this.gameService.gameRealService.roomId,
            timer: this.gameService.gameRealService.timer,
        });
        this.isPanicMode = true;
    }

    saveStats() {
        const question = this.gameService.gameRealService.question;
        if (question !== null) {
            const savedStats: QuestionStatistics = [this.histogramDataValue, this.histogramDataChangingResponses, question];
            if (question.type !== QuestionType.QLR) this.gameStats.push(savedStats);
        }
    }

    requestNextQuestion() {
        this.isPanicMode = false;
        this.gameService.gameRealService.validated = false;
        this.gameService.gameRealService.locked = false;
        this.socketService.send(socketEvent.START_TRANSITION, this.gameService.gameRealService.roomId);
    }

    handleLastQuestion() {
        this.sendGameStats();
        this.socketService.send(socketEvent.SHOW_RESULT, this.gameService.gameRealService.roomId);
    }

    configureBaseSocketFeatures() {
        this.reset();
        this.handleTimeTransition();
        this.handleEndQuestion();
        this.handleFinalTimeTransition();
        this.handleRefreshChoicesStats();
        this.handleGetInitialQuestion();
        this.handleGetNextQuestion();
        this.handleRemovedPlayer();
        this.handleEndQuestionAfterRemoval();
        this.handleEvaluationOver();
        this.handleRefreshActivityStats();
    }

    private handleTimeTransition() {
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
    }

    private handleEndQuestion() {
        this.socketService.on(socketEvent.END_QUESTION, () => {
            this.gameService.audio.pause();
            this.gameService.audio.currentTime = 0;
            this.gameService.gameRealService.audioPaused = false;
            this.gameService.gameRealService.inTimeTransition = true;
            this.resetInterface();
            if (this.gameService.question?.type === QuestionType.QCM) {
                this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers, false);
            } else {
                this.sendQrlAnswer();
            }
        });
    }

    private handleFinalTimeTransition() {
        this.socketService.on(socketEvent.FINAL_TIME_TRANSITION, (timeValue: number) => {
            this.timerText = timerMessage.resultAvailableIn;
            this.gameService.gameRealService.timer = timeValue;
            if (this.gameService.timer === 0 && this.gameService.username === HOST_USERNAME) {
                this.isGameOver = true;
                this.interactiveListService.isFinal = true;
                this.gameService.audio.pause();
                this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers);
            }
        });
    }

    private handleRefreshChoicesStats() {
        this.socketService.on(socketEvent.REFRESH_CHOICES_STATS, (choicesStatsValue: number[]) => {
            this.histogramDataChangingResponses = this.createChoicesStatsMap(choicesStatsValue);
        });
    }

    private handleGetInitialQuestion() {
        this.socketService.on(socketEvent.GET_INITIAL_QUESTION, async (data: InitialQuestionData) => {
            const numberOfPlayers = await this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers);
            this.initGraph(data.question, numberOfPlayers);
        });
    }

    private handleGetNextQuestion() {
        this.socketService.on(socketEvent.GET_NEXT_QUESTION, async (data: NextQuestionData) => {
            const numberOfPlayers = await this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers);
            this.initGraph(data.question, numberOfPlayers);
        });
    }

    private handleRemovedPlayer() {
        this.socketService.on(socketEvent.REMOVED_PLAYER, (username) => {
            const playerIndex = this.interactiveListService.players.findIndex((player: Player) => player[0] === username);
            if (playerIndex !== PLAYER_NOT_FOUND_INDEX) {
                this.leftPlayers.push(this.interactiveListService.players[playerIndex]);
                this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers, false);
            }
        });
    }

    private handleEndQuestionAfterRemoval() {
        this.socketService.on(socketEvent.END_QUESTION_AFTER_REMOVAL, () => {
            this.resetInterface();
        });
    }

    private handleEvaluationOver() {
        this.socketService.on(socketEvent.EVALUATION_OVER, () => {
            this.interactiveListService.getPlayersList(this.roomId, this.leftPlayers, false);
            this.isHostEvaluating = false;
        });
    }

    private handleRefreshActivityStats() {
        this.socketService.on(socketEvent.REFRESH_ACTIVITY_STATS, (activityStatsValue: [number, number]) => {
            this.histogramDataChangingResponses = new Map([
                [ACTIVE, activityStatsValue[ACTIVE_STATUS]],
                [INACTIVE, activityStatsValue[INACTIVE_STATUS]],
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
                [ACTIVE, 0],
                [INACTIVE, numberOfPlayers as number],
            ]);
            this.histogramDataValue = new Map([
                [ACTIVE, true],
                [INACTIVE, false],
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
            this.responsesQRL = new Map(JSON.parse(playerAnswers));
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
            const values = Array.from(stats[VALUE]);
            const responses = Array.from(stats[RESPONSE]);
            data.push([values, responses, stats[2]]);
        });
        return data;
    }

    private reset() {
        this.timerText = timerMessage.timeLeft;
        this.isGameOver = false;
        this.histogramDataChangingResponses = new Map<string, number>();
        this.histogramDataValue = new Map<string, boolean>();
        this.leftPlayers = [];
        this.responsesQRL = new Map<string, { answers: string; time: number }>();
        this.isHostEvaluating = false;
        this.gameStats = [];
        this.isPaused = false;
        this.isPanicMode = false;
    }
}
