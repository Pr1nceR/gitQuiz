import quizData from "../data/questions";
import type { QuizConfig } from "./model";

interface Props {
  config: QuizConfig;
  onChange: (patch: Partial<QuizConfig>) => void;
  onStart: () => void;
}

export function SetupScreen({ config, onChange, onStart }: Props) {
  const toggleBank = (id: string) => {
    const banks = config.banks.includes(id)
      ? config.banks.filter((b) => b !== id)
      : [...config.banks, id];
    onChange({ banks });
  };

  const pool = quizData.tests
    .filter((t) => config.banks.includes(t.id))
    .reduce((n, t) => n + t.questions.length, 0);

  return (
    <section className="sheet ruled">
      <p className="instruction">Choose your sections, then begin</p>
      <h1 className="paper-title">Question paper</h1>
      <p className="paper-meta">
        {quizData.tests.reduce((n, t) => n + t.questions.length, 0)} QUESTIONS ON FILE
        <span className="sep">|</span>EVERY ONE CARRIES ITS REASON
        <span className="sep">|</span>SET {quizData.generated}
      </p>

      <div className="syl-head" style={{ marginTop: 26 }}>
        <h2>Question banks</h2>
        <span className="score">{pool} selected</span>
      </div>
      {quizData.tests.map((test) => (
        <label className="bank" key={test.id}>
          <input
            type="checkbox"
            checked={config.banks.includes(test.id)}
            onChange={() => toggleBank(test.id)}
          />
          <span>{test.title}</span>
          <span className="count">{test.questions.length} questions</span>
        </label>
      ))}

      <div className="syl-head" style={{ marginTop: 32, marginBottom: 20 }}>
        <h2>Conditions</h2>
      </div>
      <div className="row">
        <label className="field">
          <span>Questions</span>
          <select
            value={config.count}
            onChange={(e) => onChange({ count: Number(e.target.value) })}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={0}>All selected ({pool})</option>
          </select>
        </label>
        <label className="field">
          <span>Time allowed</span>
          <select
            value={config.minutes}
            onChange={(e) => onChange({ minutes: Number(e.target.value) })}
          >
            <option value={0}>Untimed</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={90}>90 min</option>
          </select>
        </label>
        <label className="field">
          <span>Marking</span>
          <select
            value={config.instant ? "instant" : "end"}
            onChange={(e) => onChange({ instant: e.target.value === "instant" })}
          >
            <option value="instant">Marked as you go</option>
            <option value="end">Marked at the end</option>
          </select>
        </label>
      </div>

      <div className="row" style={{ marginTop: 24, gap: 22 }}>
        <label className="check">
          <input
            type="checkbox"
            checked={config.shuffleQuestions}
            onChange={(e) => onChange({ shuffleQuestions: e.target.checked })}
          />
          Shuffle the questions
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={config.shuffleAnswers}
            onChange={(e) => onChange({ shuffleAnswers: e.target.checked })}
          />
          Shuffle the answers
        </label>
      </div>

      <div className="sheet-foot">
        <button className="btn primary" onClick={onStart} disabled={!config.banks.length}>
          Turn over and begin
        </button>
      </div>

      <p className="hint">
        At the desk: <kbd>1</kbd>–<kbd>4</kbd> answers, <kbd>Enter</kbd> moves on.
      </p>
    </section>
  );
}
