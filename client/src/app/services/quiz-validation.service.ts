import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz.interface';

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
