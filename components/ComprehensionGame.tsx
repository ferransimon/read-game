"use client";

import { useState } from "react";
import type { Story } from "@/lib/schema";
import { useProgress, useT } from "@/lib/progress";
import { starsFor } from "@/lib/scoring";
import { QuestionCard } from "./QuestionCard";
import { BigButton, Confetti, ProgressDots, SoftButton, Stars, StoryText } from "./ui";

type Phase = "read" | "quiz" | "result";

export function ComprehensionGame({ story, onNext }: { story: Story; onNext?: () => void }) {
  const { t, d } = useT();
  const saveComp = useProgress((s) => s.saveComp);
  const [phase, setPhase] = useState<Phase>("read");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [showText, setShowText] = useState(false);

  const total = story.questions.length;
  const score = results.filter(Boolean).length;

  function answer(correct: boolean) {
    const next = [...results, correct];
    setResults(next);
    setShowText(false);
    if (next.length >= total) {
      saveComp(story.id, next.filter(Boolean).length);
      setPhase("result");
      window.scrollTo({ top: 0 });
    } else {
      setIndex(index + 1);
    }
  }

  function restart() {
    setPhase("read");
    setIndex(0);
    setResults([]);
    window.scrollTo({ top: 0 });
  }

  if (phase === "read")
    return (
      <div className="animate-rise flex flex-col gap-6">
        <StoryText story={story} />
        <BigButton
          tone="peach"
          onClick={() => {
            setPhase("quiz");
            window.scrollTo({ top: 0 });
          }}
        >
          {t("iHaveRead")} ✅
        </BigButton>
      </div>
    );

  if (phase === "quiz")
    return (
      <div className="flex flex-col gap-5">
        <ProgressDots total={total} current={index} results={results} />
        <p className="text-center text-base font-semibold text-muted">{t("question", { n: index + 1, total })}</p>
        <QuestionCard key={index} question={story.questions[index]} onDone={answer} />
        <SoftButton tone="sky" className="self-center" onClick={() => setShowText((v) => !v)}>
          📖 {showText ? t("hideText") : t("readText")}
        </SoftButton>
        {showText && <StoryText story={story} />}
      </div>
    );

  const stars = starsFor(score, total);
  return (
    <div className="animate-pop flex flex-col items-center gap-6 pt-4 text-center">
      <Confetti run={score >= 4} />
      <div className="text-7xl">{story.emoji}</div>
      <h2 className="text-3xl font-bold">{t("resultTitle")}</h2>
      <Stars count={stars} size="text-5xl" />
      <p className="text-2xl font-semibold">{t("yourScore", { score, total })}</p>
      <ProgressDots total={total} current={-1} results={results} />
      <p className="text-xl text-ink/80">{d.scoreMsg[score] ?? d.scoreMsg[d.scoreMsg.length - 1]}</p>
      <div className="flex w-full flex-col gap-3">
        {onNext && (
          <BigButton tone="mint" onClick={onNext}>
            {t("nextStory")} 📖
          </BigButton>
        )}
        <SoftButton tone="peach" className="w-full" onClick={restart}>
          🔁 {t("repeat")}
        </SoftButton>
        <SoftButton tone="lavender" className="w-full" href="/">
          🏠 {t("home")}
        </SoftButton>
      </div>
    </div>
  );
}
