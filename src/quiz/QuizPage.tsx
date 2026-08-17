import { useCallback, useEffect, useMemo, useState } from "react";
import { NavBar } from "../components/NavBar";
import quizData from "../data/questions";
import { shuffle } from "../lib/shuffle";
import { QuestionScreen } from "./QuestionScreen";
import { ResultsScreen } from "./ResultsScreen";
import { SetupScreen } from "./SetupScreen";
import { DEFAULT_CONFIG, type BankQuestion, type QuizConfig, type QuizItem } from "./model";

type Phase = "setup" | "quiz" | "results";

export function QuizPage() {
  const [config, setConfig] = useState<QuizConfig>({
    ...DEFAULT_CONFIG,
    banks: quizData.tests.map((t) => t.id),
  });
  const [phase, setPhase] = useState<Phase>("setup");
  const [items, setItems] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const pool = useMemo<BankQuestion[]>(
    () =>
      quizData.tests
        .filter((t) => config.banks.includes(t.id))
        .flatMap((t) => t.questions.map((q) => ({ ...q, bankTitle: t.title }))),
    [config.banks],
  );

  const start = useCallback(
    (questions: BankQuestion[], useAll = false) => {
      const ordered = config.shuffleQuestions ? shuffle(questions) : questions;
      const limited = !useAll && config.count > 0 ? ordered.slice(0, config.count) : ordered;

      setItems(
        limited.map((question) => ({
          question,
          options: config.shuffleAnswers ? shuffle(question.options) : question.options,
          picked: null,
          locked: false,
        })),
      );
      setIndex(0);
      setTimeLeft(config.minutes > 0 ? config.minutes * 60 : null);
      setPhase("quiz");
      window.scrollTo(0, 0);
    },
    [config],
  );

  const finish = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, locked: true })));
    setTimeLeft(null);
    setPhase("results");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (phase !== "quiz" || timeLeft === null) return;
    if (timeLeft <= 0) {
      finish();
      return;
    }
    const id = window.setTimeout(() => setTimeLeft((t) => (t === null ? null : t - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [phase, timeLeft, finish]);

  const pick = useCallback(
    (key: string) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index && !item.locked ? { ...item, picked: key, locked: config.instant } : item,
        ),
      );
    },
    [index, config.instant],
  );

  const step = useCallback(
    (delta: number) => {
      setIndex((i) => Math.max(0, Math.min(items.length - 1, i + delta)));
      window.scrollTo(0, 0);
    },
    [items.length],
  );

  useEffect(() => {
    if (phase !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      const item = items[index];
      if (!item) return;
      if (/^[1-9]$/.test(e.key)) {
        const opt = item.options[Number(e.key) - 1];
        if (opt) {
          e.preventDefault();
          pick(opt.key);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (index === items.length - 1) finish();
        else step(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, items, index, pick, step, finish]);

  const answered = items.filter((i) => i.picked).length;

  return (
    <>
      <NavBar meta={`${pool.length} QUESTIONS SELECTED`} />
      <div className="wrap">
        {phase === "setup" && (
          <SetupScreen
            config={config}
            onChange={(patch) => setConfig((c) => ({ ...c, ...patch }))}
            onStart={() => start(pool)}
          />
        )}

        {phase === "quiz" && items[index] && (
          <QuestionScreen
            item={items[index]}
            index={index}
            total={items.length}
            answered={answered}
            timeLeft={timeLeft}
            onPick={pick}
            onStep={step}
            onFinish={finish}
          />
        )}

        {phase === "results" && (
          <ResultsScreen
            items={items}
            onRestart={() => setPhase("setup")}
            onRetryWrong={(wrong) => start(wrong.map((i) => i.question), true)}
          />
        )}
      </div>
    </>
  );
}
