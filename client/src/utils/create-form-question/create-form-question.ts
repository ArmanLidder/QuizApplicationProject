import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormChoice, FormQuestion } from '@common/interfaces/quiz-form.interface';
import { QuestionType } from '@common/enums/question-type.enum';

const fb = new FormBuilder();

export const createFormQuestionFormGroup = (question: FormQuestion): FormGroup => {
    return fb.group({
        type: [question.type === QuestionType.QCM ? 'QCM' : 'QLR'],
        text: [question.text, Validators.required],
        points: [question.points],
        choices: fb.array(
            question.choices.map((choice: FormChoice) =>
                fb.group({
                    text: [choice.text],
                    isCorrect: [choice.isCorrect],
                }),
            ),
        ),
        beingModified: [question.beingModified],
    });
};
