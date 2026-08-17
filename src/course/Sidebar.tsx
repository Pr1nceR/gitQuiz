import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Tick } from "../components/Marks";
import courseData from "../data/lessons";
import type { FlatLesson } from "./useProgress";

interface Props {
  lessons: FlatLesson[];
  done: Record<string, boolean>;
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ lessons, done, open, onNavigate }: Props) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(lessons.filter((e) => e.plain.includes(q)).map((e) => e.lesson.id));
  }, [query, lessons]);

  const groups = courseData.sections
    .map((section) => ({
      section,
      lessons: section.lessons.filter((l) => !matches || matches.has(l.id)),
    }))
    .filter((g) => g.lessons.length > 0);

  return (
    <nav className={`contents${open ? " open" : ""}`} aria-label="Sections">
      <input
        className="contents-search"
        type="search"
        placeholder="Search the paper…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      <NavLink to="/course" end className="entry" onClick={onNavigate}>
        <span />
        <span>Front page</span>
        <span />
      </NavLink>

      {groups.length === 0 && <p className="empty">Nothing on the paper matches that.</p>}

      {groups.map(({ section, lessons: visible }) => (
        <div key={section.id}>
          <div className="group-head">
            <span>{section.title}</span>
            <span>
              {visible.filter((l) => done[l.id]).length}/{visible.length}
            </span>
          </div>
          {visible.map((lesson) => (
            <NavLink
              key={lesson.id}
              to={`/course/${lesson.id}`}
              className="entry"
              onClick={onNavigate}
            >
              <span>{done[lesson.id] ? <Tick size={15} title="Marked complete" /> : null}</span>
              <span>{lesson.title}</span>
              <span className="entry-mins">{lesson.minutes}m</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
