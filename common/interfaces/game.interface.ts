import { QuizQuestion } from './quiz.interface';

export interface NextQuestionData {
    question: QuizQuestion;
    index: number;
    isLast: boolean;
}
