import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Quiz, QuizChoice, QuizQuestion, QuestionType } from '@app/interfaces/quiz.interface';

const DIVIDER = 10;
const MIN_QUESTION_POINTS = 10;
const MAX_QUESTION_POINTS = 100;
const MAX_DURATION = 60;
const MIN_DURATION = 10;
const MIN_NUMBER_OF_CHOICES = 2;
const MAX_NUMBER_OF_CHOICES = 4;
const FORMAT_TYPE_ERROR = `
Le fichier que vous voulez importé doit seulement comporter les propriétés suivantes:\n
    1 - titre\n
    2 - description\n
    3 - Dernière modification\n
    4 - Questions comprenant un type, un text et des choix\n
    5 - Choix doivent comprendre du text et ne valeur de véracité booléenne.\n

Veuillez recommencer avec le bon format!.
`;

@Injectable({
    providedIn: 'root',
})
export class QuizValidationService {
    isQuiz(quiz: unknown): quiz is Quiz {
        const isValid =
            typeof quiz === 'object' &&
            quiz !== null &&
            typeof (quiz as Quiz).title === 'string' &&
            typeof (quiz as Quiz).description === 'string' &&
            typeof (quiz as Quiz).duration === 'number' &&
            typeof (quiz as Quiz).lastModification === 'string' &&
            this.isQuestion(quiz as Quiz);
        if (!isValid) window.alert(FORMAT_TYPE_ERROR);
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

        if (isNaN(quiz.duration) || quiz.duration <= MIN_DURATION || quiz.duration >= MAX_DURATION) {
            errors.push('La durée doit être comprise entre 10 et 60 secondes');
        }

        if (!quiz.questions || quiz.questions.length === 0) {
            errors.push('Le quiz devrait contenir au moins une question');
        } else {
            quiz.questions.forEach((question, index) => {
                const questionErrors = this.validateQuestion(question, index);
                errors.push(...questionErrors);
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
            errors.push(`Question ${index + 1} : les points doivent être entre 10 et 100 et être divisible par 10`);
        }

        if (question.type === QuestionType.QCM) {
            const choicesErrors = this.validateQuestionChoices(index, question.choices);
            errors.push(...choicesErrors);
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

    private isQuestion(quiz: Quiz): boolean {
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
