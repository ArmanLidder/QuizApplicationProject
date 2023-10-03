import { Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayAreaConst } from '@app/interfaces/play-area-const';
import { Quiz, QuizChoice } from '@common/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit, OnDestroy {
    playAreaConst: PlayAreaConst = {
        defaultWidth: 200,
        defaultHeignt: 200,
        intervalTime: 10,
        testValidationTime: 3,
        testMultPoint: 1.2,
        normalValidationTime: 5,
    };

    intervalId = setInterval(() => void 0, 0);
    tempPath = true;
    testPage = false;
    addingPoints = false;
    bgColor = 'transparent';
    validationTime = this.playAreaConst.normalValidationTime;
    bonusPointMultiplicator = 1;
    timeEnd = false;
    initInfos = true;
    timer = 0;
    currentTimerIndex = 0;
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
    numberOfCorrectCards = 0;
    numberOfCorrectAnswers = 0;
    selectedCard = [false, false, false, false];
    private timeService: TimeService;
    private quizService: QuizService;
    private route: ActivatedRoute;
    private router: Router;
    constructor(injector: Injector) {
        this.timeService = injector.get<TimeService>(TimeService);
        this.quizService = injector.get<QuizService>(QuizService);
        this.route = injector.get<ActivatedRoute>(ActivatedRoute);
        this.router = injector.get<Router>(Router);
    }

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
                this.numberOfCorrectCards++;
                this.selectedCard[index] = true;
            } else if (this.answerChoices[index].isCorrect && this.selectedCard[index]) {
                this.numberOfCorrectCards--;
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
        this.numberOfCorrectCards = 0;
        this.selectedCard = [false, false, false, false];
        this.questionIndex++;
        this.clickedValidation = false;
        this.timeEnd = false;
        this.initInfos = true;
        this.addingPoints = false;
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
            for (const CHOICE of this.answerChoices) {
                if (CHOICE.isCorrect) {
                    this.numberOfCorrectAnswers++;
                }
            }
        }
    }

    validationButtonLocked() {
        if (this.clickedValidation && !this.timeEnd) {
            this.timeService.setTime(this.currentTimerIndex, 0);
        }

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
            if (this.numberOfCorrectCards === this.numberOfCorrectAnswers && this.numberOfIncorrectCards === 0) {
                this.pointage += this.questionPoints * this.bonusPointMultiplicator;
                this.addingPoints = true;
            }
            this.timeEnd = true;
            this.timeService.stopTimer(this.currentTimerIndex);

            if (this.timeService.timersArray.length < 2) {
                this.timeService.createTimer(this.validationTime);
            }

            this.currentTimerIndex = this.currentTimerIndex + 1;
            this.timeService.startTimer(this.currentTimerIndex);
        } else if (this.timeEnd && this.timeService.getTime(this.currentTimerIndex) === 0) {
            if (this.questionIndex < this.quiz.questions.length - 1) {
                this.resetInfos();
            } else {
                this.router.navigate(['/game-creation-page']);
            }
        }
    }

    runGame() {
        this.intervalId = setInterval(() => {
            if (this.initInfos) {
                this.setQuestionInfos();
                this.initInfos = false;
            }
            this.validationButtonLocked();
            this.timer = this.timeService.getTime(this.currentTimerIndex);
            this.setNumberOfCorrectAnswers();
            this.timeElapsedConditions();

            if (this.clearInterval) {
                this.timeService.deleteAllTimers();
                clearInterval(this.intervalId);
            }
        }, this.playAreaConst.intervalTime);
    }
    ngOnInit(): void {
        this.route.params.subscribe(() => {
            const QUIZID = this.tempPath ? this.route.snapshot.paramMap.get('id') : '1';
            this.testPage = this.tempPath ? this.route.snapshot.url[0].path === 'quiz-testing-page' : true;
            if (this.testPage) {
                this.validationTime = this.playAreaConst.testValidationTime;
                this.bonusPointMultiplicator = this.playAreaConst.testMultPoint;
            }
            if (QUIZID !== null) {
                this.quizService.basicGetById(QUIZID).subscribe((quiz) => {
                    this.quiz = quiz;
                    this.initInfos = true;

                    this.runGame();
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.clearInterval = true;
    }
}
