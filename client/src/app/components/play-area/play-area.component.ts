import { Component, HostListener, OnInit } from '@angular/core';
import { Quiz, QuizChoice } from '@app/interfaces/quiz.interface';
import { QuizService } from '@app/services/quiz.service';
import { TimeService } from '@app/services/time.service';
import { ActivatedRoute } from '@angular/router';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
const validationTime = 3;
const intervalTime = 10;

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit {
    bgColor = 'transparent';
    timeEnd = false;
    timer = 0;
    currentTimerIndex = 0;
    locked = false;
    selectedChoice = false;
    disableOption = false;
    clickedValidation = false;
    quizId = this.route.snapshot.paramMap.get('id');
    quiz: Quiz;
    currentQuestion = '';
    time = 0;
    questionPoints = 0;
    questionIndex = 0;
    answerChoices: QuizChoice[] | undefined;
    pointage = 0;
    numberOfIncorrectCards = 0;
    numberOfcorrectCards = 0;
    selectedCard = [false, false, false, false];
    constructor(
        private readonly timeService: TimeService,
        private quizService: QuizService,
        private route: ActivatedRoute,
    ) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.bgColor = 'green';
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

    ngOnInit(): void {
        if (this.quizId !== null) {
            this.quizService.basicGetById(this.quizId).subscribe((quiz) => {
                this.quiz = quiz;
                this.timer = this.quiz.duration;
                this.timeService.createTimer(this.timer);
                this.timeService.startTimer(this.currentTimerIndex);

                setInterval(() => {
                    this.time = this.timeService.getTime(this.currentTimerIndex);
                    this.currentQuestion = this.quiz.questions[this.questionIndex].text;
                    this.questionPoints = this.quiz.questions[this.questionIndex].points;
                    this.answerChoices = this.quiz.questions[this.questionIndex].choices;

                    if (!this.timeEnd && this.timeService.getTime(this.currentTimerIndex) === 0) {
                        if (this.numberOfcorrectCards > 0 && this.numberOfIncorrectCards === 0) {
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
                            this.numberOfIncorrectCards = 0;
                            this.numberOfcorrectCards = 0;
                            this.selectedCard = [false, false, false, false];
                            this.questionIndex++;
                            this.selectedChoice = false;
                            this.clickedValidation = false;
                            this.timeEnd = false;
                            this.timeService.stopTimer(this.currentTimerIndex);
                            this.currentTimerIndex = this.currentTimerIndex - 1;
                            this.timeService.startTimer(this.currentTimerIndex);
                        }
                    }

                    if (this.timeEnd || this.clickedValidation) {
                        this.disableOption = true;
                        this.bgColor = 'green';
                    } else {
                        this.disableOption = false;
                        this.bgColor = 'transparent';
                    }
                }, intervalTime);
            });
        }
    }
}
