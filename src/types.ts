export interface Option {
  key: string;
  text: string;
}

export interface Question {
  n: number;
  topic: string;
  text: string;
  options: Option[];
  answer: string;
  explanation: string | null;
}

export interface Test {
  id: string;
  title: string;
  minutes: number;
  pass: number;
  questions: Question[];
}

export interface QuizData {
  generated: string;
  tests: Test[];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface Lesson {
  id: string;
  title: string;
  source: string;
  words: number;
  minutes: number;
  toc: TocItem[];
  html: string;
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export interface CourseData {
  generated: string;
  sections: Section[];
}
