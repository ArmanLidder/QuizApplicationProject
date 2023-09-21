export interface FormChoice {
    text: string;
    selectedChoice: string;
}

export interface FormQuestion {
    type: string;
    text: string;
    points: number;
    textchoix: string;
    selectedChoice: string;
    choices: FormChoice[]; // Add an empty choices array
}