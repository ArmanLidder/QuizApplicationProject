enum QuestionType {
    QCM,
    QLR,
}

export interface Quiz {
    id: string;
    title: string;
    duration: number;
    lastModification: string | null;
    questions: QuizQuestion[];
    visible: boolean;
}

export interface QuizQuestion {
    type: QuestionType;
    text: string;
    points: number;
    choices?: QuizChoice[];
}

export interface QuizChoice {
    text: string;
    isCorrect?: boolean;
}
