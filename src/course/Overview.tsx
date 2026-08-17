import { useNavigate } from "react-router-dom";
import { Tick } from "../components/Marks";
import courseData from "../data/lessons";
import type { FlatLesson } from "./useProgress";

interface Props {
  lessons: FlatLesson[];
  done: Record<string, boolean>;
}

export function Overview({ lessons, done }: Props) {
  const navigate = useNavigate();
  const minutes = lessons.reduce((n, e) => n + e.lesson.minutes, 0);
  const numberOf = new Map(lessons.map((e, i) => [e.lesson.id, i + 1]));

  return (
    <section className="sheet ruled">
      <p className="instruction">Answer all sections</p>
      <h1 className="paper-title">GitHub Copilot Certification</h1>
      <p className="paper-meta">
        STUDY PAPER<span className="sep">|</span>
        {lessons.length} SECTIONS<span className="sep">|</span>
        {minutes} MINUTES READING<span className="sep">|</span>
        COMPILED {courseData.generated}
      </p>
      <p className="paper-lede">
        Everything below is set from the study guide: the two-week schedule, the twelve core
        guides, the five hands-on exercise sets and the prompt-pattern reference. Tick the
        checklist items as you work through a section, and mark the section off when it is done.
      </p>

      {courseData.sections.map((section) => {
        const doneHere = section.lessons.filter((l) => done[l.id]).length;
        return (
          <div className="syl-section" key={section.id}>
            <div className="syl-head">
              <h2>{section.title}</h2>
              <span className="score">
                {doneHere} / {section.lessons.length} marked
              </span>
            </div>
            <p className="syl-sub">{section.subtitle}</p>
            {section.lessons.map((lesson) => (
              <button
                key={lesson.id}
                className={`syl-item${done[lesson.id] ? " done" : ""}`}
                onClick={() => navigate(`/course/${lesson.id}`)}
              >
                <span className="no">{String(numberOf.get(lesson.id)).padStart(2, "0")}.</span>
                <span className="name">{lesson.title}</span>
                <span className="mins">{lesson.minutes} min</span>
                {done[lesson.id] && (
                  <span className="syl-tick">
                    <Tick size={18} title="Marked complete" />
                  </span>
                )}
              </button>
            ))}
          </div>
        );
      })}
    </section>
  );
}
