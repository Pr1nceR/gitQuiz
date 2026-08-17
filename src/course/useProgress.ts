import { useMemo } from "react";
import courseData from "../data/lessons";
import { useStoredState } from "../lib/useStoredState";
import type { Lesson, Section } from "../types";

export interface FlatLesson {
  lesson: Lesson;
  section: Section;
  plain: string;
}

interface Progress {
  done: Record<string, boolean>;
  tasks: Record<string, Record<string, boolean>>;
}

const EMPTY: Progress = { done: {}, tasks: {} };

let cachedFlat: FlatLesson[] | null = null;

/** Lesson list plus a lowercased text version of each lesson, built once. */
export function flatLessons(): FlatLesson[] {
  if (cachedFlat) return cachedFlat;
  const scratch = document.createElement("div");
  cachedFlat = courseData.sections.flatMap((section) =>
    section.lessons.map((lesson) => {
      scratch.innerHTML = lesson.html;
      return { lesson, section, plain: `${lesson.title} ${scratch.textContent}`.toLowerCase() };
    }),
  );
  scratch.innerHTML = "";
  return cachedFlat;
}

export function useProgress() {
  const [progress, setProgress, reset] = useStoredState<Progress>("copilot-course-v1", EMPTY);
  const lessons = useMemo(flatLessons, []);

  const doneCount = lessons.filter((e) => progress.done[e.lesson.id]).length;

  const toggleDone = (id: string) =>
    setProgress((p) => {
      const done = { ...p.done };
      if (done[id]) delete done[id];
      else done[id] = true;
      return { ...p, done };
    });

  const setTask = (lessonId: string, taskId: string, checked: boolean) =>
    setProgress((p) => ({
      ...p,
      tasks: { ...p.tasks, [lessonId]: { ...p.tasks[lessonId], [taskId]: checked } },
    }));

  return {
    lessons,
    done: progress.done,
    tasks: progress.tasks,
    doneCount,
    percent: Math.round((doneCount / lessons.length) * 100),
    toggleDone,
    setTask,
    reset,
  };
}
