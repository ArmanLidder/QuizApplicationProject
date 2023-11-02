import { Quiz, QuizQuestion, QuizChoice } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';
import { Answers } from '@app/interface/game-interface';
import { Score } from '@common/interfaces/score.interface';

type Username = string;
type Players = Map<Username, Score>;
type PlayerAnswers = Map<Username, Answers>;
type ChoiceStats = Map<string, number>;

const BONUS_MULTIPLIER = 1.2;

export class Game {
    currIndex: number = 0;
    quiz: Quiz;
    players: Players = new Map();
    currentQuizQuestion: QuizQuestion;
    question: string;
    choicesStats: ChoiceStats = new Map();
    correctChoices: string[] = [];
    duration: number;
    playersAnswers: PlayerAnswers = new Map();

    constructor(
        usernames: string[],
        quizId: string,
        private readonly quizService: QuizService,
    ) {
        this.configurePlayers(usernames);
    }

    async setup(id: string) {
        await this.getQuiz(id);
    }

    next() {
        this.playersAnswers.clear();
        this.currIndex++;
        this.setValues();
    }

    storePlayerAnswer(username: string, time: number, playerAnswer: string[]) {
        this.updateChoicesStats(playerAnswer);
        this.playersAnswers.set(username, { answers: playerAnswer, time: this.duration - time });
    }

    removePlayer(username: string) {
        this.playersAnswers.delete(username);
    }

    updateScores() {
        this.playersAnswers.forEach((player, username) => {
            if (this.validateAnswer(player.answers)) this.handleGoodAnswer(username);
            else this.handleWrongAnswer(username);
        });
    }

    private updateChoicesStats(playerAnswer: string[]) {
        playerAnswer.forEach((answer: string) => {
            if (this.choicesStats.has(answer)) {
                const oldValue = this.choicesStats.get(answer);
                this.choicesStats.set(answer, oldValue + 1);
            }
        });
    }

    private validateAnswer(playerAnswers: string[]) {
        if (playerAnswers.length === 0) return false;
        for (const answer of playerAnswers) {
            if (!this.correctChoices.includes(answer)) {
                return false;
            }
        }
        return true;
    }

    private handleGoodAnswer(username: string) {
        const oldScore = this.players.get(username);
        const points = this.currentQuizQuestion.points;
        let newScore: Score;
        const fastestPlayers = this.getFastestPlayer();
        if (fastestPlayers && fastestPlayers.has(username)) {
            newScore = {
                points: fastestPlayers.has(username) ? oldScore.points + this.addBonusPoint(points) : oldScore.points + points,
                bonusCount: fastestPlayers.has(username) ? oldScore.bonusCount + 1 : oldScore.bonusCount,
                isBonus: fastestPlayers.has(username),
            };
        } else {
            newScore = {
                points: oldScore.points + points,
                bonusCount: oldScore.bonusCount,
                isBonus: false,
            };
        }
        this.players.set(username, newScore);
    }

    private addBonusPoint(points: number) {
        return points * BONUS_MULTIPLIER;
    }

    private handleWrongAnswer(username: string) {
        this.players.get(username).isBonus = false;
        this.playersAnswers.delete(username);
    }

    private getAllPlayersCorrectAnswer() {
        const playersCorrectAnswer: PlayerAnswers = new Map();
        this.playersAnswers.forEach((player, username) => {
            if (this.validateAnswer(player.answers)) {
                playersCorrectAnswer.set(username, player);
            }
        });
        return playersCorrectAnswer;
    }

    private getFastestPlayer() {
        let lowestTime = Infinity;
        const lowestTimePlayers: PlayerAnswers = new Map();
        const playerAnswers = this.getAllPlayersCorrectAnswer();
        for (const [username, answers] of playerAnswers) {
            if (answers.time < lowestTime) {
                lowestTime = answers.time;
                lowestTimePlayers.clear();
                lowestTimePlayers.set(username, answers);
            } else if (answers.time === lowestTime) {
                lowestTimePlayers.set(username, answers);
            }
        }
        return lowestTimePlayers.size === 1 ? lowestTimePlayers : null;
    }

    private configurePlayers(usernames: string[]) {
        usernames.forEach((username) => {
            this.players.set(username, { points: 0, bonusCount: 0, isBonus: false });
        });
    }

    private setValues() {
        this.currentQuizQuestion = this.quiz.questions[this.currIndex];
        this.question = this.currentQuizQuestion.text;
        this.getAllCorrectChoices();
        this.duration = this.quiz.duration;
        this.currentQuizQuestion.choices.forEach((choice) => {
            this.choicesStats.set(choice.text, 0);
        });
    }

    private getAllCorrectChoices() {
        this.currentQuizQuestion.choices.forEach((choice: QuizChoice) => {
            if (choice.isCorrect) this.correctChoices.push(choice.text);
        });
    }

    private async getQuiz(quizId: string) {
        this.quiz = await this.quizService.getById(quizId);
        this.setValues();
    }
}
