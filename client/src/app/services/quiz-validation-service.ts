import { Injectable } from '@angular/core';
import { QuestionType, Quiz, QuizChoice, QuizQuestion } from '@app/interfaces/quiz.interface';
import { AbstractControl } from '@angular/forms';

const DIVIDER = 10;
const MAX_QUESTION_POINTS = 60;
const MIN_QUESTION_POINTS = 10;
const MIN_NUMBER_OF_CHOICES = 2;
const MAX_NUMBER_OF_CHOICES = 4;

@Injectable({
    providedIn: 'root',
})
export class QuizValidationService {
    isValidQuizFormat(quiz: Quiz): boolean {
        const isValid =
            typeof quiz.id === 'string' &&
            typeof quiz.title === 'string' &&
            typeof quiz.description === 'string' &&
            typeof quiz.duration === 'number' &&
            typeof quiz.lastModification === 'string' &&
            this.isValidQuestions(quiz);
        return isValid;
    }

    validateChoicesForm(control: AbstractControl): { [key: string]: boolean } | null {
        const choices = control.value;
        if (
            choices.some((choice: QuizChoice) => (choice.isCorrect as unknown as string) === 'true') &&
            choices.some((choice: QuizChoice) => (choice.isCorrect as unknown as string) === 'false')
        ) {
            return null;
        } else {
            return { invalidChoices: true };
        }
    }

    divisibleByTen(control: AbstractControl): { [key: string]: boolean } | null {
        const value = control.value;
        if (value % DIVIDER === 0) {
            return null;
        } else {
            return { notDivisibleByTen: true };
        }
    }

    validateQuiz(quiz: Quiz): string[] {
        const errors: string[] = [];

        if (!quiz.title || quiz.title.trim() === '') {
            errors.push('Le titre est requis');
        }

        if (!quiz.description || quiz.description.trim() === '') {
            errors.push('La description est requise');
        }

        if (isNaN(quiz.duration) || quiz.duration <= 0) {
            errors.push('La durée est requise');
        }

        if (!quiz.questions || quiz.questions.length === 0) {
            errors.push('Le quiz devrait contenir au moins une question');
        } else {
            quiz.questions.forEach((question, index) => {
                const questionErrors = this.validateQuestion(question, index);
                if (questionErrors.length > 0) {
                    errors.push(...questionErrors);
                }
            });
        }

        return errors;
    }

    validateQuestion(question: QuizQuestion, index: number): string[] {
        const errors: string[] = [];

        if (!question.text || question.text.trim() === '') {
            errors.push(`Question ${index + 1} : le texte est requis.`);
        }

        if (!question.points) {
            errors.push(`Question ${index + 1} : les points d'une question sont requis`);
        }

        if (question.points < MIN_QUESTION_POINTS || question.points > MAX_QUESTION_POINTS || question.points % DIVIDER !== 0) {
            errors.push(`Question ${index + 1} : les points doivent être entre 10 et 60 et être divisible par 10`);
        }

        if (question.type === QuestionType.QCM) {
            const choicesErrors = this.validateQuestionChoices(index, question.choices);
            if (choicesErrors.length > 0) {
                errors.push(...choicesErrors);
            }
        }

        return errors;
    }

    validateQuestionChoices(questionIndex: number, choices?: QuizChoice[]): string[] {
        const errors: string[] = [];

        if (!choices || choices.length < MIN_NUMBER_OF_CHOICES || choices.length > MAX_NUMBER_OF_CHOICES) {
            errors.push(`Question ${questionIndex + 1} : doit avoir au moins deux choix et au plus quatre choix`);
        } else {
            choices.forEach((choice, choiceIndex) => {
                if (!choice.text || choice.text.trim() === '') {
                    errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1} : le texte est requis`);
                }

                if (choice.isCorrect === null || choice.isCorrect === undefined) {
                    errors.push(`Question ${questionIndex + 1}, Choice ${choiceIndex + 1} : un choix doit être soit vrai soit faux`);
                }
            });

            const hasCorrectChoice = choices.some((choice) => choice.isCorrect === true);
            const hasIncorrectChoice = choices.some((choice) => choice.isCorrect === false);

            if (!hasCorrectChoice || !hasIncorrectChoice) {
                errors.push(`Question ${questionIndex + 1} : on doit au moins avoir une bonne réponse et une mauvaise réponse`);
            }
        }

        return errors;
    }

    private isValidQuestions(quiz: Quiz): boolean {
        return (
            Array.isArray(quiz.questions) &&
            quiz.questions.every(
                (question) =>
                    typeof question.type === 'number' &&
                    typeof question.text === 'string' &&
                    typeof question.points === 'number' &&
                    Array.isArray(question.choices) &&
                    question.choices.every(
                        (choice) => typeof choice.text === 'string' && (choice.isCorrect === undefined || typeof choice.isCorrect === 'boolean'),
                    ),
            )
        );
    }
}
