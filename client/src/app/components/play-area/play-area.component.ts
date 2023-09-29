import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Quiz, QuizChoice } from '@app/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';
import { TimeService } from '@app/services/time.service';
import { ActivatedRoute } from '@angular/router';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
const validationTime = 5;
const intervalTime = 10;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit, OnDestroy {
    bgColor = 'transparent';
    timeEnd = false;
    initInfos = true;
    timer = 0;
    currentTimerIndex = 0;
    locked = false;
    disableOption = false;
    clickedValidation = false;
    clearInterval = false;
    quiz: Quiz;
    currentQuestion = '';
    questionPoints = 0;
    questionIndex = 0;
    answerChoices: QuizChoice[] | undefined;
    pointage = 0;
    numberOfIncorrectCards = 0;
    numberOfcorrectCards = 0;
    numberOfCorrectAnswers = 0;
    selectedCard = [false, false, false, false];

    constructor(
        private readonly timeService: TimeService,
        private quizService: QuizService,
        private route: ActivatedRoute,
    ) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.clickedValidation = true;
        }
        if (this.answerChoices && this.answerChoices.length > 1) {
            if (event.key <= this.answerChoices.length.toString()) {
                if (!this.clickedValidation) {
                    this.onCardSelected(parseInt(event.key, 10) - 1);
                }
            }
        }
    }

    onCardSelected(index: number) {
        if (this.answerChoices && this.answerChoices.length > 1 && this.answerChoices[index] !== undefined) {
            if (this.answerChoices[index].isCorrect && !this.selectedCard[index]) {
                this.numberOfcorrectCards++;
                this.selectedCard[index] = true;
            } else if (this.answerChoices[index].isCorrect && this.selectedCard[index]) {
                this.numberOfcorrectCards--;
                this.selectedCard[index] = false;
            }

            if (!this.answerChoices[index].isCorrect && !this.selectedCard[index]) {
                this.numberOfIncorrectCards++;
                this.selectedCard[index] = true;
            } else if (!this.answerChoices[index].isCorrect && this.selectedCard[index]) {
                this.numberOfIncorrectCards--;
                this.selectedCard[index] = false;
            }
        }
    }

    resetInfos() {
        this.numberOfIncorrectCards = 0;
        this.numberOfcorrectCards = 0;
        this.selectedCard = [false, false, false, false];
        this.questionIndex++;
        this.clickedValidation = false;
        this.timeEnd = false;
        this.initInfos = true;
        this.timeService.deleteAllTimers();
        this.currentTimerIndex = 0;
        this.timeService.createTimer(this.quiz.duration);
        this.timeService.startTimer(this.currentTimerIndex);
    }

    setQuestionInfos() {
        this.currentQuestion = this.quiz.questions[this.questionIndex].text;
        this.questionPoints = this.quiz.questions[this.questionIndex].points;
        this.answerChoices = this.quiz.questions[this.questionIndex].choices;
        this.currentTimerIndex = 0;
        this.timeService.deleteAllTimers();
        this.timeService.createTimer(this.quiz.duration);
        this.timeService.startTimer(this.currentTimerIndex);
    }

    setNumberOfCorrectAnswers() {
        this.numberOfCorrectAnswers = 0;
        if (this.answerChoices !== undefined) {
            for (const choice of this.answerChoices) {
                if (choice.isCorrect) {
                    this.numberOfCorrectAnswers++;
                }
            }
        }
    }

    validationButtonLocked() {
        if (this.timeEnd || this.clickedValidation) {
            this.disableOption = true;
            this.bgColor = 'green';
        } else {
            this.disableOption = false;
            this.bgColor = 'transparent';
        }
    }

    timeElapsedConditions() {
        if (!this.timeEnd && this.timeService.getTime(this.currentTimerIndex) === 0) {
            if (this.numberOfcorrectCards === this.numberOfCorrectAnswers && this.numberOfIncorrectCards === 0) {
                this.pointage += this.questionPoints;
            }
            this.timeEnd = true;
            this.timeService.stopTimer(this.currentTimerIndex);

            if (this.timeService.timersArray.length < 2) {
                this.timeService.createTimer(validationTime);
            }

            this.currentTimerIndex = this.currentTimerIndex + 1;
            this.timeService.startTimer(this.currentTimerIndex);
        } else if (this.timeEnd && this.timeService.getTime(this.currentTimerIndex) === 0) {
            if (this.questionIndex < this.quiz.questions.length - 1) {
                this.resetInfos();
            }
        }
    }

    ngOnInit(): void {
        this.route.params.subscribe(() => {
            const quizId = this.route.snapshot.paramMap.get('id');
            if (quizId !== null) {
                this.quizService.basicGetById(quizId).subscribe((quiz) => {
                    this.quiz = quiz;
                    this.initInfos = true;
                    const intervalId = setInterval(() => {
                        if (this.initInfos) {
                            this.setQuestionInfos();
                            this.initInfos = false;
                        }

                        this.timer = this.timeService.getTime(this.currentTimerIndex);
                        this.setNumberOfCorrectAnswers();
                        this.timeElapsedConditions();
                        this.validationButtonLocked();

                        if (this.clearInterval) {
                            this.timeService.deleteAllTimers();
                            clearInterval(intervalId);
                        }
                    }, intervalTime);
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.clearInterval = true;
    }
}
