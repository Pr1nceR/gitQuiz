import { useEffect, useRef } from "react";
import type { FlatLesson } from "./useProgress";

interface Props {
  entry: FlatLesson;
  number: number;
  isDone: boolean;
  tasks: Record<string, boolean>;
  hasPrev: boolean;
  hasNext: boolean;
  onToggleDone: () => void;
  onStep: (delta: number) => void;
  onTask: (taskId: string, checked: boolean) => void;
}

export function LessonView({
  entry,
  number,
  isDone,
  tasks,
  hasPrev,
  hasNext,
  onToggleDone,
  onStep,
  onTask,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { lesson } = entry;

  // The checkboxes live inside pre-rendered HTML, so their state is applied imperatively.
  useEffect(() => {
    const boxes = bodyRef.current?.querySelectorAll<HTMLInputElement>("input.task-box");
    boxes?.forEach((box) => {
      const id = box.dataset.task ?? "";
      const checked = id in tasks ? tasks[id] : box.dataset.default === "1";
      box.checked = checked;
      box.parentElement?.classList.toggle("checked", checked);
    });
  }, [lesson.id, tasks]);

  // React only emits onChange for inputs it created, so delegate clicks instead.
  const onBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target instanceof HTMLInputElement && target.classList.contains("task-box")) {
      onTask(target.dataset.task ?? "", target.checked);
    }
  };

  // Mermaid diagrams arrive as pre-rendered HTML, so render them from the CDN after injection.
  useEffect(() => {
    const nodes = bodyRef.current?.querySelectorAll<HTMLElement>("pre.mermaid");
    if (!nodes || nodes.length === 0) return;
    let cancelled = false;
    import(
      /* @vite-ignore */ "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
    )
      .then(({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
        void mermaid.run({ nodes: Array.from(nodes) });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lesson.id]);

  return (
    <article className="sheet ruled">
      <span className="q-no">{String(number).padStart(2, "0")}</span>
      {isDone && <span className="stamp">Completed</span>}

      <h1 className="paper-title">{lesson.title}</h1>
      <p className="paper-meta">
        {entry.section.title.toUpperCase()}
        <span className="sep">|</span>
        {lesson.minutes} MIN<span className="sep">|</span>
        {lesson.words.toLocaleString()} WORDS<span className="sep">|</span>
        {lesson.source}
      </p>

      <div
        className="content"
        ref={bodyRef}
        onClick={onBodyClick}
        dangerouslySetInnerHTML={{ __html: lesson.html }}
      />

      <div className="sheet-foot">
        <button className="btn quiet" disabled={!hasPrev} onClick={() => onStep(-1)}>
          Previous section
        </button>
        <button className={`btn ${isDone ? "marked" : "primary"}`} onClick={onToggleDone}>
          {isDone ? "Marked complete" : "Mark this section"}
        </button>
        <span className="spacer" />
        <button className="btn quiet" disabled={!hasNext} onClick={() => onStep(1)}>
          Next section
        </button>
      </div>
    </article>
  );
}
