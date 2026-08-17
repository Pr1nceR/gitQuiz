import { useMemo, useState } from "react";
import { Cross, Ring, Tick } from "../components/Marks";
import quizData from "../data/questions";
import { RichText } from "../lib/RichText";
import { isCorrect, optionText, type QuizItem } from "./model";

interface Props {
  items: QuizItem[];
  onRestart: () => void;
  onRetryWrong: (questions: QuizItem[]) => void;
}

export function ResultsScreen({ items, onRestart, onRetryWrong }: Props) {
  const [wrongOnly, setWrongOnly] = useState(false);

  const correct = items.filter(isCorrect).length;
  const pct = Math.round((correct / items.length) * 100);

  const verdict =
    pct >= 90
      ? "A comfortable pass"
      : pct >= 80
        ? "At the pass standard"
        : pct >= 70
          ? "Just short"
          : "Not ready yet";

  const note =
    pct >= 90
      ? "Nothing here says you are unprepared. Keep the weak banks warm."
      : pct >= 80
        ? "80% is the working pass mark. Read your misses before you book."
        : pct >= 70
          ? "The gap is small and it is in named topics. Go back to those sections."
          : "Work the paper again before booking the exam.";

  const breakdown = useMemo(() => {
    const map = new Map<string, { n: number; ok: number }>();
    for (const item of items) {
      const row = map.get(item.question.bankTitle) ?? { n: 0, ok: 0 };
      row.n += 1;
      if (isCorrect(item)) row.ok += 1;
      map.set(item.question.bankTitle, row);
    }
    const order = quizData.tests.map((t) => t.title);
    return [...map.entries()].sort(
      (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
    );
  }, [items]);

  const review = wrongOnly ? items.filter((i) => !isCorrect(i)) : items;

  return (
    <>
      <section className="sheet ruled">
        <p className="instruction">Front cover</p>
        <div className="total">
          <div className="total-figure">
            <Ring />
            <div className="n">
              {correct}/{items.length}
            </div>
          </div>
          <div className="total-copy">
            <p className={`verdict ${pct >= 80 ? "pass" : "fail"}`}>
              {pct}% · {verdict}
            </p>
            <p>{note}</p>
          </div>
        </div>

        <table className="markgrid" style={{ marginTop: 30 }}>
          <thead>
            <tr>
              <th>Bank</th>
              <th>Marks</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map(([name, row]) => {
              const p = Math.round((row.ok / row.n) * 100);
              return (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="num">
                    {row.ok} / {row.n}
                  </td>
                  <td className={`num ${p >= 80 ? "pass" : "fail"}`}>{p}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">
                {correct} / {items.length}
              </td>
              <td className={`num ${pct >= 80 ? "pass" : "fail"}`}>{pct}%</td>
            </tr>
          </tfoot>
        </table>

        <div className="sheet-foot">
          <button className="btn primary" onClick={onRestart}>
            Set another paper
          </button>
          <button
            className="btn quiet"
            disabled={correct === items.length}
            onClick={() => onRetryWrong(items.filter((i) => !isCorrect(i)))}
          >
            Re-sit the misses
          </button>
          <span className="spacer" />
          <label className="check">
            <input
              type="checkbox"
              checked={wrongOnly}
              onChange={(e) => setWrongOnly(e.target.checked)}
            />
            Misses only
          </label>
        </div>
      </section>

      <section className="sheet ruled">
        <h2 className="paper-title" style={{ fontSize: 22 }}>
          Marked script
        </h2>
        <p className="paper-meta">
          {review.length} OF {items.length} QUESTIONS SHOWN
        </p>

        {review.length === 0 ? (
          <p className="empty" style={{ marginTop: 24 }}>
            Nothing to mark. Every answer was right.
          </p>
        ) : (
          <div style={{ marginTop: 22, marginLeft: "calc(var(--margin-col) * -1)" }}>
            {review.map((item, i) => {
              const ok = isCorrect(item);
              const yours = optionText(item.question, item.picked);
              return (
                <div className="script-item" key={i}>
                  <span className="q-mark">
                    {ok ? <Tick size={30} /> : <Cross size={30} />}
                  </span>
                  <p className="script-head">
                    {items.indexOf(item) + 1} · {item.question.bankTitle}
                    {item.question.topic ? ` · ${item.question.topic}` : ""}
                  </p>
                  <div className="qtext" style={{ fontSize: 16 }}>
                    <RichText text={item.question.text} />
                  </div>
                  <div className="answer-line">
                    <span className="lbl">You wrote</span>
                    <div className={ok ? "pass" : "fail"}>
                      {yours ? <RichText text={yours} /> : "nothing"}
                    </div>
                  </div>
                  <div className="answer-line">
                    <span className="lbl">Answer</span>
                    <div className="pass">
                      <RichText text={optionText(item.question, item.question.answer) ?? ""} />
                    </div>
                  </div>
                  <div className="answer-line">
                    <span className="lbl">Because</span>
                    <div>
                      {item.question.explanation ? (
                        <RichText text={item.question.explanation} />
                      ) : (
                        "No reason was recorded."
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
