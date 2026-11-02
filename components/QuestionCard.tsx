"use client";

import { useState } from "react";
import type { Question } from "@/lib/schema";
import { pick } from "@/lib/i18n";
import { useT } from "@/lib/progress";
import { BigButton } from "./ui";

type Choice = { label: string; icon?: string; correct: boolean };

function choicesFor(q: Question, trueLabel: string, falseLabel: string): Choice[] {
  if (q.type === "choice") return q.options.map((o, i) => ({ label: o, correct: i === q.answer }));
  return [
    { label: trueLabel, icon: "👍", correct: q.answer === true },
    { label: falseLabel, icon: "👎", correct: q.answer === false },
  ];
}

/**
 * One question with immediate feedback. Calls `onDone(correct)` when the child taps "Next".
 */
export function QuestionCard({
  question,
  onDone,
  nextLabel,
}: {
  question: Question;
  onDone: (correct: boolean) => void;
  nextLabel?: string;
}) {
  const { t, d } = useT();
  const [chosen, setChosen] = useState<number | null>(null);
  const [message] = useState(() => ({ ok: pick(d.correct), ko: pick(d.wrong) }));
  const choices = choicesFor(question, t("trueLabel"), t("falseLabel"));
  const answered = chosen !== null;
  const isCorrect = answered && choices[chosen].correct;
  const isTf = question.type === "tf";

  return (
    <div className="animate-rise flex flex-col gap-5">
      <p className="rounded-blob bg-paper p-5 text-2xl font-semibold leading-snug ring-1 ring-line">
        {isTf && <span className="mb-2 block text-base font-semibold text-muted">{t("trueLabel")} / {t("falseLabel")}</span>}
        {question.q}
      </p>

      <div className={isTf ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
        {choices.map((c, i) => {
          let state = "bg-paper ring-2 ring-line";
          if (answered) {
            if (c.correct) state = "bg-mint ring-2 ring-mint-strong";
            else if (i === chosen) state = "bg-rose ring-2 ring-rose-strong animate-shake";
            else state = "bg-paper ring-2 ring-line opacity-50";
          }
          return (
            <button
              key={i}
              type="button"
              data-testid="opt"
              disabled={answered}
              onClick={() => setChosen(i)}
              className={`flex min-h-16 items-center gap-3 rounded-2xl px-5 py-4 text-left text-xl font-semibold transition active:scale-[0.98] ${state} ${isTf ? "flex-col justify-center text-center" : ""}`}
            >
              {c.icon ? (
                <span className="text-4xl">{c.icon}</span>
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lavender text-base font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
              )}
              <span className="flex-1">{c.label}</span>
              {answered && c.correct && <span className="text-2xl">✅</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="animate-pop flex flex-col gap-4">
          <p className={`text-center text-2xl font-bold ${isCorrect ? "text-mint-strong" : "text-rose-strong"}`}>
            {isCorrect ? `🎉 ${message.ok}` : `💪 ${message.ko}`}
          </p>
          <BigButton tone={isCorrect ? "mint" : "lavender"} onClick={() => onDone(isCorrect)}>
            {nextLabel ?? t("next")} →
          </BigButton>
        </div>
      )}
    </div>
  );
}
