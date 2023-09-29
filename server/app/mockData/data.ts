import { QuestionType } from '@app/interfaces/quiz.interface';

export const fillerQuizzes = [
    {
        id: '1',
        title: 'Math Quiz',
        description: 'its a math quiz.',
        duration: 30,
        lastModification: '2023-09-15',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is 2 + 2?',
                points: 50,
                choices: [{ text: '3' }, { text: '4', isCorrect: true }, { text: '5' }],
            },
        ],
        visible: true,
    },
    {
        id: '2',
        title: 'Science Quiz',
        description: 'its a science quiz!',
        duration: 45,
        lastModification: '2023-09-15',
        questions: [
            {
                type: QuestionType.QCM,
                text: 'What is the chemical symbol for water?',
                points: 50,
                choices: [
                    { text: 'O2', isCorrect: false },
                    { text: 'H2O', isCorrect: true },
                    { text: 'CO2', isCorrect: true },
                ],
            },
            {
                type: QuestionType.QCM,
                text: 'What is the boiling point of water in Celsius?',
                points: 10,
                choices: [
                    { text: '0°C', isCorrect: false },
                    { text: '100°C', isCorrect: true },
                    { text: '50°C', isCorrect: true },
                    { text: '-10°C', isCorrect: false },
                ],
            },
        ],
        visible: false,
    },
];
