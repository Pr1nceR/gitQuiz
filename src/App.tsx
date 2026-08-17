import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { CoursePage } from "./course/CoursePage";
import { QuizPage } from "./quiz/QuizPage";

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/course" element={<CoursePage />} />
        <Route path="/course/:lessonId" element={<CoursePage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="*" element={<Navigate to="/course" replace />} />
      </Routes>
    </HashRouter>
  );
}
