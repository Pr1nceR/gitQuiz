import type { Option, Question } from "../types";

export interface BankQuestion extends Question {
  bankTitle: string;
}

export interface QuizItem {
  question: BankQuestion;
  options: Option[];
  picked: string | null;
  locked: boolean;
}

export interface QuizConfig {
  banks: string[];
  count: number;
  minutes: number;
  instant: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
}

export const DEFAULT_CONFIG: QuizConfig = {
  banks: [],
  count: 25,
  minutes: 45,
  instant: true,
  shuffleQuestions: true,
  shuffleAnswers: false,
};

export function isCorrect(item: QuizItem) {
  return item.picked === item.question.answer;
}

export function optionText(question: BankQuestion, key: string | null) {
  return question.options.find((o) => o.key === key)?.text ?? null;
}
