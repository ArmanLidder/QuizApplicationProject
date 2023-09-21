import { Injectable } from '@angular/core';
import { Quiz } from '@app/interfaces/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class FileValidationService {

  isValidQuiz(file: File): boolean {
    if (this.isJSON(file)) try { return this.isValidQuizFormat(file); } catch (error) { return false; }
    else return false;
  }

  private isJSON(file: File): boolean {
    return file.type.toLowerCase() === 'application/json'
  }

  private isValidQuizFormat(file: File): boolean {
    const quiz = file as unknown as Quiz;
    console.log(quiz);
    const isValid = (
      typeof quiz.id === 'string' &&
      typeof quiz.title === 'string' &&
      typeof quiz.description === 'string' &&
      typeof quiz.duration === 'number' &&
      typeof quiz.lastModification === 'string' &&
      typeof quiz.visible === 'boolean' &&
      this.isValidQuestions(file)
    );
    console.log(isValid);
    return (isValid !== undefined) ? isValid : false;
  }
  
  private isValidQuestions(file: any): boolean {
    const quiz = file as Quiz;
    return (
      Array.isArray(quiz.questions) &&
      quiz.questions.every((question) =>
        typeof question.type === 'number' &&
        typeof question.text === 'string' &&
        typeof question.points === 'number' &&
        Array.isArray(question.choices) &&
            question.choices.every((choice) =>
              typeof choice.text === 'string' &&
              (choice.isCorrect === undefined || typeof choice.isCorrect === 'boolean')
            )
      ));
  }
}
