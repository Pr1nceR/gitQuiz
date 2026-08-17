import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FlatLesson } from "./useProgress";

interface Props {
  lessons: FlatLesson[];
  done: Record<string, boolean>;
  doneCount: number;
  percent: number;
  tickCount: number;
  onReset: () => void;
}

export function Slip({ lessons, done, doneCount, percent, tickCount, onReset }: Props) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const next = lessons.find((e) => !done[e.lesson.id]) ?? lessons[0];
  const remaining = lessons.filter((e) => !done[e.lesson.id]).reduce((n, e) => n + e.lesson.minutes, 0);

  return (
    <aside className="slip">
      <h2>Candidate record</h2>
      <dl>
        <div>
          <dt>Sections</dt>
          <dd>
            {doneCount} / {lessons.length}
          </dd>
        </div>
        <div>
          <dt>Checklist ticks</dt>
          <dd>{tickCount}</dd>
        </div>
        <div>
          <dt>Reading left</dt>
          <dd>{remaining} min</dd>
        </div>
      </dl>
      <span className="gauge">
        <i style={{ width: `${percent}%` }} />
      </span>

      <button className="btn primary" onClick={() => navigate(`/course/${next.lesson.id}`)}>
        {doneCount === 0
          ? "Begin section 01"
          : doneCount === lessons.length
            ? "Read again from 01"
            : "Resume where you stopped"}
      </button>
      {confirming ? (
        <div className="slip-confirm">
          <p>Strike out every tick and every marked section?</p>
          <button
            className="btn quiet"
            onClick={() => {
              onReset();
              setConfirming(false);
            }}
          >
            Yes, strike it out
          </button>
          <button className="btn quiet" onClick={() => setConfirming(false)}>
            Leave the record
          </button>
        </div>
      ) : (
        <button className="btn quiet" onClick={() => setConfirming(true)}>
          Clear the record
        </button>
      )}
    </aside>
  );
}
