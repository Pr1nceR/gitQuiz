import { Cross, Tick } from "../components/Marks";
import { RichText } from "../lib/RichText";
import { isCorrect, type QuizItem } from "./model";

interface Props {
  item: QuizItem;
  index: number;
  total: number;
  answered: number;
  timeLeft: number | null;
  onPick: (key: string) => void;
  onStep: (delta: number) => void;
  onFinish: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function QuestionScreen({
  item,
  index,
  total,
  answered,
  timeLeft,
  onPick,
  onStep,
  onFinish,
}: Props) {
  const { question } = item;
  const last = index === total - 1;
  const correct = isCorrect(item);

  return (
    <>
      <div className="q-status">
        <span>
          QUESTION {index + 1} OF {total} · {answered} ANSWERED
        </span>
        {timeLeft !== null && (
          <span className={`timer${timeLeft <= 60 ? " low" : ""}`}>{formatTime(timeLeft)}</span>
        )}
      </div>
      <div className="progress-rule">
        <div style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <section className="sheet ruled">
        <span className="q-no">{String(index + 1).padStart(2, "0")}</span>
        {item.locked && (
          <span className="q-mark">
            {correct ? (
              <Tick size={30} className="mark-draw" title="Correct" />
            ) : (
              <Cross size={30} className="mark-draw" title="Incorrect" />
            )}
          </span>
        )}

        <div className="qtext">
          <RichText text={question.text} />
        </div>
        <p className="q-topic">
          {question.bankTitle}
          {question.topic ? ` · ${question.topic}` : ""}
        </p>

        {item.options.map((opt, i) => {
          const classes = ["option"];
          if (item.picked === opt.key && !item.locked) classes.push("picked");
          if (item.locked) {
            if (opt.key === question.answer) classes.push("right");
            else if (item.picked === opt.key) classes.push("wrong");
          }
          const showTick = item.locked && opt.key === question.answer;
          const showCross = item.locked && item.picked === opt.key && !correct;
          return (
            <button
              key={opt.key}
              className={classes.join(" ")}
              disabled={item.locked}
              onClick={() => onPick(opt.key)}
            >
              <span className="letter">{i + 1}</span>
              <div>
                <RichText text={opt.text} />
              </div>
              <span>
                {showTick && <Tick size={22} className="mark-draw" />}
                {showCross && <Cross size={22} className="mark-draw" />}
              </span>
            </button>
          );
        })}

        {item.locked && (
          <div className={`marker-note ${correct ? "right" : "wrong"}`}>
            <span className="verdict">
              {correct ? "Correct" : item.picked ? "Not this one" : "Left blank"}
            </span>
            {question.explanation ? (
              <RichText text={question.explanation} />
            ) : (
              "No reason was recorded for this question."
            )}
          </div>
        )}

        <div className="q-foot">
          <button className="btn quiet" disabled={index === 0} onClick={() => onStep(-1)}>
            Back
          </button>
          <span className="spacer" />
          {!last && (
            <button className="btn quiet" onClick={() => onStep(1)}>
              Leave blank
            </button>
          )}
          <button className="btn primary" onClick={() => (last ? onFinish() : onStep(1))}>
            {last ? "Hand it in" : "Next"}
          </button>
        </div>
      </section>

      <div className="desk-note">
        <button onClick={onFinish}>Stop and mark what I have done</button>
      </div>
    </>
  );
}
