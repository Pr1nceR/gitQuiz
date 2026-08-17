import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NavBar } from "../components/NavBar";
import { LessonView } from "./LessonView";
import { Overview } from "./Overview";
import { Sidebar } from "./Sidebar";
import { Slip } from "./Slip";
import { Toc } from "./Toc";
import { useProgress } from "./useProgress";

function ReadBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="readbar" style={{ width: `${pct}%` }} />;
}

export function CoursePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lessons, done, tasks, doneCount, percent, toggleDone, setTask, reset } = useProgress();

  const index = lessons.findIndex((e) => e.lesson.id === lessonId);
  const entry = index >= 0 ? lessons[index] : null;

  const tickCount = useMemo(
    () =>
      Object.values(tasks).reduce(
        (n, lesson) => n + Object.values(lesson).filter(Boolean).length,
        0,
      ),
    [tasks],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

  useEffect(() => {
    if (lessonId && index < 0) navigate("/course", { replace: true });
  }, [lessonId, index, navigate]);

  const step = (delta: number) => {
    const target = lessons[index + delta];
    if (target) navigate(`/course/${target.lesson.id}`);
  };

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <NavBar
        meta={`${lessons.length} SECTIONS / ${lessons.reduce((n, e) => n + e.lesson.minutes, 0)} MIN`}
        left={
          entry ? (
            <button
              className="btn quiet"
              id="menuBtn"
              aria-label="Show sections"
              onClick={() => setMenuOpen((o) => !o)}
            >
              Sections
            </button>
          ) : undefined
        }
      >
        <div className="tally">
          <span>
            marked <b>{doneCount}</b> of {lessons.length}
          </span>
          <span className="gauge">
            <i style={{ width: `${percent}%` }} />
          </span>
        </div>
      </NavBar>
      <ReadBar />

      <div className={entry ? "layout" : "layout front"}>
        <Sidebar
          lessons={lessons}
          done={done}
          open={menuOpen}
          onNavigate={() => setMenuOpen(false)}
        />

        <main>
          {entry ? (
            <LessonView
              entry={entry}
              number={index + 1}
              isDone={!!done[entry.lesson.id]}
              tasks={tasks[entry.lesson.id] ?? {}}
              hasPrev={index > 0}
              hasNext={index < lessons.length - 1}
              onToggleDone={() => toggleDone(entry.lesson.id)}
              onStep={step}
              onTask={(taskId, checked) => setTask(entry.lesson.id, taskId, checked)}
            />
          ) : (
            <Overview lessons={lessons} done={done} />
          )}
        </main>

        {entry ? (
          <Toc items={entry.lesson.toc} />
        ) : (
          <Slip
            lessons={lessons}
            done={done}
            doneCount={doneCount}
            percent={percent}
            tickCount={tickCount}
            onReset={reset}
          />
        )}
      </div>
    </>
  );
}
